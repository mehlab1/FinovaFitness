import { query, getClient } from '../database.js';

class StoreController {
  // ==============================================
  // CATEGORY MANAGEMENT
  // ==============================================

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const result = await query(
        'SELECT * FROM store_categories WHERE is_active = true ORDER BY name'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  // Add new category (Admin only)
  async addCategory(req, res) {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const result = await query(
        'INSERT INTO store_categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Category name already exists' });
      }
      console.error('Error adding category:', error);
      res.status(500).json({ error: 'Failed to add category' });
    }
  }

  // Update category (Admin only)
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const result = await query(
        'UPDATE store_categories SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
        [name, description, is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  // ==============================================
  // ITEM MANAGEMENT
  // ==============================================

  // Get all items with category info
  async getAllItems(req, res) {
    try {
      const { category_id, search } = req.query;
      let queryText = `
        SELECT 
          si.*,
          sc.name as category_name,
          sc.description as category_description
        FROM store_items si
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE si.is_active = true
      `;
      const queryParams = [];
      let paramCount = 0;

      if (category_id) {
        paramCount++;
        queryText += ` AND si.category_id = $${paramCount}`;
        queryParams.push(category_id);
      }

      if (search) {
        paramCount++;
        queryText += ` AND (si.name ILIKE $${paramCount} OR si.description ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      queryText += ' ORDER BY si.name';

      const result = await query(queryText, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  // Add new item (Admin only)
  async addItem(req, res) {
    try {
      const {
        category_id,
        name,
        description,
        price,
        member_discount_percentage,
        stock_quantity,
        low_stock_threshold,
        image_url
      } = req.body;

      if (!name || !price || !category_id) {
        return res.status(400).json({ 
          error: 'Name, price, and category are required' 
        });
      }

      if (price < 0) {
        return res.status(400).json({ error: 'Price must be positive' });
      }

      if (member_discount_percentage < 0 || member_discount_percentage > 100) {
        return res.status(400).json({ 
          error: 'Member discount must be between 0 and 100' 
        });
      }

      const result = await query(
        `INSERT INTO store_items (
          category_id, name, description, price, member_discount_percentage,
          stock_quantity, low_stock_threshold, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          category_id, name, description, price, member_discount_percentage || 0,
          stock_quantity || 0, low_stock_threshold || 5, image_url
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding item:', error);
      res.status(500).json({ error: 'Failed to add item' });
    }
  }

  // Update item (Admin only)
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updateFields = req.body;

      // Build dynamic update query
      const setClause = [];
      const values = [];
      let paramCount = 0;

      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined) {
          paramCount++;
          setClause.push(`${key} = $${paramCount}`);
          values.push(updateFields[key]);
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const queryText = `
        UPDATE store_items 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount + 1} 
        RETURNING *
      `;

      const result = await query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }

  // Update stock quantity (Admin only)
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock_quantity, notes, transaction_type } = req.body;

      if (stock_quantity === undefined) {
        return res.status(400).json({ error: 'Stock quantity is required' });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Get current stock
        const currentStockResult = await client.query(
          'SELECT stock_quantity FROM store_items WHERE id = $1',
          [id]
        );

        if (currentStockResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Item not found' });
        }

        const currentStock = currentStockResult.rows[0].stock_quantity;
        const newStock = stock_quantity;

        // Update item stock
        await client.query(
          'UPDATE store_items SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newStock, id]
        );

        // Record inventory transaction
        await client.query(
          `INSERT INTO store_inventory_transactions (
            item_id, transaction_type, quantity, previous_stock, new_stock, 
            reference_type, reference_id, notes, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id, transaction_type || 'adjustment', newStock - currentStock,
            currentStock, newStock, 'admin_adjustment', null, notes, req.user?.id
          ]
        );

        await client.query('COMMIT');

        res.json({ 
          message: 'Stock updated successfully',
          previous_stock: currentStock,
          new_stock: newStock
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  // ==============================================
  // CART MANAGEMENT
  // ==============================================

  // Create or get cart
  async createOrGetCart(req, res) {
    try {
      const { user_id, guest_email, guest_name, guest_phone } = req.body;

      let cart;
      
      if (user_id) {
        // User cart
        const existingCart = await query(
          'SELECT * FROM store_carts WHERE user_id = $1',
          [user_id]
        );

        if (existingCart.rows.length > 0) {
          cart = existingCart.rows[0];
        } else {
          const result = await query(
            'INSERT INTO store_carts (user_id) VALUES ($1) RETURNING *',
            [user_id]
          );
          cart = result.rows[0];
        }
      } else if (guest_email && guest_name) {
        // Guest cart
        const result = await query(
          'INSERT INTO store_carts (guest_email, guest_name, guest_phone) VALUES ($1, $2, $3) RETURNING *',
          [guest_email, guest_name, guest_phone]
        );
        cart = result.rows[0];
      } else {
        return res.status(400).json({ 
          error: 'Either user_id or guest_email and guest_name are required' 
        });
      }

      res.json(cart);
    } catch (error) {
      console.error('Error creating/getting cart:', error);
      res.status(500).json({ error: 'Failed to create/get cart' });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { cart_id, item_id, quantity } = req.body;

      if (!cart_id || !item_id || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: 'Cart ID, item ID, and positive quantity are required' 
        });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Check if item exists and has stock
        const itemResult = await client.query(
          'SELECT * FROM store_items WHERE id = $1 AND is_active = true',
          [item_id]
        );

        if (itemResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Item not found or inactive' });
        }

        const item = itemResult.rows[0];
        if (item.stock_quantity < quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: `Only ${item.stock_quantity} items available in stock` 
          });
        }

        // Check if item already in cart
        const existingItem = await client.query(
          'SELECT * FROM store_cart_items WHERE cart_id = $1 AND item_id = $2',
          [cart_id, item_id]
        );

        if (existingItem.rows.length > 0) {
          // Update quantity
          const newQuantity = existingItem.rows[0].quantity + quantity;
          await client.query(
            'UPDATE store_cart_items SET quantity = $1 WHERE cart_id = $2 AND item_id = $3',
            [newQuantity, cart_id, item_id]
          );
        } else {
          // Add new item to cart
          await client.query(
            `INSERT INTO store_cart_items (
              cart_id, item_id, quantity, price_at_time, member_discount_applied
            ) VALUES ($1, $2, $3, $4, $5)`,
            [cart_id, item_id, quantity, item.price, 0] // Member discount calculated later
          );
        }

        await client.query('COMMIT');

        // Return updated cart
        const cartResult = await query(
          `SELECT 
            sci.*,
            si.name, si.description, si.image_url,
            sc.name as category_name
          FROM store_cart_items sci
          JOIN store_items si ON sci.item_id = si.id
          LEFT JOIN store_categories sc ON si.category_id = sc.id
          WHERE sci.cart_id = $1`,
          [cart_id]
        );

        res.json(cartResult.rows);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  // Get cart contents
  async getCart(req, res) {
    try {
      const { cart_id } = req.params;

      const result = await query(
        `SELECT 
          sci.*,
          si.name, si.description, si.image_url, si.stock_quantity,
          sc.name as category_name
        FROM store_cart_items sci
        JOIN store_items si ON sci.item_id = si.id
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE sci.cart_id = $1`,
        [cart_id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  }

  // Update cart item quantity
  async updateCartItem(req, res) {
    try {
      const { cart_id, item_id } = req.params;
      const { quantity } = req.body;

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be positive' });
      }

      // Check stock availability
      const stockResult = await query(
        'SELECT stock_quantity FROM store_items WHERE id = $1',
        [item_id]
      );

      if (stockResult.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (stockResult.rows[0].stock_quantity < quantity) {
        return res.status(400).json({ 
          error: `Only ${stockResult.rows[0].stock_quantity} items available` 
        });
      }

      if (quantity === 0) {
        // Remove item from cart
        await query(
          'DELETE FROM store_cart_items WHERE cart_id = $1 AND item_id = $2',
          [cart_id, item_id]
        );
      } else {
        // Update quantity
        await query(
          'UPDATE store_cart_items SET quantity = $1 WHERE cart_id = $1 AND item_id = $2',
          [quantity, cart_id, item_id]
        );
      }

      res.json({ message: 'Cart updated successfully' });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ error: 'Failed to update cart' });
    }
  }

  // ==============================================
  // CHECKOUT & ORDERS
  // ==============================================

  // Process checkout
  async checkout(req, res) {
    try {
      const {
        cart_id,
        customer_name,
        customer_email,
        customer_phone,
        payment_method,
        pickup_notes
      } = req.body;

      if (!cart_id || !customer_name || !customer_email || !payment_method) {
        return res.status(400).json({ 
          error: 'Cart ID, customer name, email, and payment method are required' 
        });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Get cart items with current stock
        const cartItemsResult = await client.query(
          `SELECT 
            sci.*,
            si.name, si.price, si.member_discount_percentage, si.stock_quantity
          FROM store_cart_items sci
          JOIN store_items si ON sci.item_id = si.id
          WHERE sci.cart_id = $1`,
          [cart_id]
        );

        if (cartItemsResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate totals and check stock
        let totalAmount = 0;
        let memberDiscountTotal = 0;
        const orderItems = [];

        for (const item of cartItemsResult.rows) {
          // Get current stock for this item
          const currentStockResult = await client.query(
            'SELECT stock_quantity FROM store_items WHERE id = $1',
            [item.item_id]
          );
          
          if (currentStockResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
              error: `Item ${item.name} not found` 
            });
          }
          
          const currentStock = currentStockResult.rows[0].stock_quantity;
          
          if (currentStock < item.quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
              error: `Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${item.quantity}` 
            });
          }

          const itemTotal = item.price * item.quantity;
          const memberDiscount = (item.price * item.member_discount_percentage / 100) * item.quantity;
          
          totalAmount += itemTotal;
          memberDiscountTotal += memberDiscount;
          
          orderItems.push({
            item_id: item.item_id,
            quantity: item.quantity,
            price_at_time: item.price,
            member_discount_applied: memberDiscount,
            subtotal: itemTotal - memberDiscount,
            current_stock: currentStock
          });
        }

        const finalAmount = totalAmount - memberDiscountTotal;

        // Generate order number
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Create order
        const orderResult = await client.query(
          `INSERT INTO store_orders (
            cart_id, order_number, customer_name, customer_email, customer_phone,
            total_amount, member_discount_total, final_amount, payment_method,
            pickup_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            cart_id, orderNumber, customer_name, customer_email, customer_phone,
            totalAmount, memberDiscountTotal, finalAmount, payment_method, pickup_notes
          ]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO store_order_items (
              order_id, item_id, quantity, price_at_time, 
              member_discount_applied, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              order.id, item.item_id, item.quantity, item.price_at_time,
              item.member_discount_applied, item.subtotal
            ]
          );

          // Update stock
          await client.query(
            'UPDATE store_items SET stock_quantity = stock_quantity - $1 WHERE id = $2',
            [item.quantity, item.item_id]
          );

          // Record inventory transaction
          await client.query(
            `INSERT INTO store_inventory_transactions (
              item_id, transaction_type, quantity, previous_stock, new_stock,
              reference_type, reference_id, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              item.item_id, 'stock_out', item.quantity,
              item.current_stock, item.current_stock - item.quantity,
              'order', order.id, `Order ${orderNumber}`
            ]
          );
        }

        // Create initial status history
        await client.query(
          `INSERT INTO store_order_status_history (
            order_id, status, notes
          ) VALUES ($1, $2, $3)`,
          [order.id, 'pending', 'Order created successfully']
        );

        // Clear cart
        await client.query(
          'DELETE FROM store_cart_items WHERE cart_id = $1',
          [cart_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
          message: 'Order placed successfully',
          order: {
            ...order,
            items: orderItems
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  }

  // Get order by order number
  async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;

      const orderResult = await query(
        `SELECT 
          so.*,
          sc.name as category_name
        FROM store_orders so
        LEFT JOIN store_carts sc ON so.cart_id = sc.id
        WHERE so.order_number = $1`,
        [orderNumber]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await query(
        `SELECT 
          soi.*,
          si.name, si.description, si.image_url,
          sc.name as category_name
        FROM store_order_items soi
        JOIN store_items si ON soi.item_id = si.id
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE soi.order_id = $1`,
        [order.id]
      );

      // Get status history
      const statusResult = await query(
        'SELECT * FROM store_order_status_history WHERE order_id = $1 ORDER BY created_at DESC',
        [order.id]
      );

      res.json({
        ...order,
        items: itemsResult.rows,
        status_history: statusResult.rows
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  // Get orders by email
  async getOrdersByEmail(req, res) {
    try {
      const { email } = req.params;

      const result = await query(
        `SELECT 
          so.id, so.order_number, so.customer_name, so.final_amount,
          so.payment_status, so.order_status, so.created_at
        FROM store_orders so
        WHERE so.customer_email = $1
        ORDER BY so.created_at DESC`,
        [email]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // ==============================================
  // ADMIN ORDER MANAGEMENT
  // ==============================================

  // Get all orders with filters (Admin only)
  async getAllOrders(req, res) {
    try {
      const { status, payment_status, limit = 50, offset = 0 } = req.query;

      let queryText = `
        SELECT 
          so.*,
          COUNT(soi.id) as items_count
        FROM store_orders so
        LEFT JOIN store_order_items soi ON so.id = soi.order_id
        WHERE 1=1
      `;
      const queryParams = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        queryText += ` AND so.order_status = $${paramCount}`;
        queryParams.push(status);
      }

      if (payment_status) {
        paramCount++;
        queryText += ` AND so.payment_status = $${paramCount}`;
        queryParams.push(payment_status);
      }

      queryText += ` GROUP BY so.id ORDER BY so.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      queryParams.push(parseInt(limit), parseInt(offset));

      const result = await query(queryText, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // Update order status (Admin only)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Update order status
        const orderResult = await client.query(
          'UPDATE store_orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, id]
        );

        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Order not found' });
        }

        // Add status history
        await client.query(
          `INSERT INTO store_order_status_history (
            order_id, status, notes, changed_by
          ) VALUES ($1, $2, $3, $4)`,
          [id, status, notes, req.user?.id]
        );

        await client.query('COMMIT');

        res.json({ 
          message: 'Order status updated successfully',
          order: orderResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  // Confirm payment (Admin only)
  async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      const { payment_status, admin_notes } = req.body;

      if (!payment_status) {
        return res.status(400).json({ error: 'Payment status is required' });
      }

      const validStatuses = ['pending', 'confirmed', 'failed'];
      if (!validStatuses.includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment status' });
      }

      const result = await query(
        `UPDATE store_orders 
         SET payment_status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 RETURNING *`,
        [payment_status, admin_notes, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ 
        message: 'Payment status updated successfully',
        order: result.rows[0]
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }

  // Get inventory overview (Admin only)
  async getInventoryOverview(req, res) {
    try {
      const result = await query(
        `SELECT 
          si.id, si.name, si.stock_quantity, si.low_stock_threshold,
          sc.name as category_name,
          CASE 
            WHEN si.stock_quantity = 0 THEN 'out_of_stock'
            WHEN si.stock_quantity <= si.low_stock_threshold THEN 'low_stock'
            ELSE 'in_stock'
          END as stock_status
        FROM store_items si
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE si.is_active = true
        ORDER BY si.stock_quantity ASC`
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching inventory overview:', error);
      res.status(500).json({ error: 'Failed to fetch inventory overview' });
    }
  }

  // ==============================================
  // ENHANCED ADMIN FEATURES
  // ==============================================

  // Delete product (Admin only)
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      
      // Soft delete - set is_active to false
      const result = await query(
        'UPDATE store_items SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json({ 
        message: 'Item deleted successfully',
        item: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  // Generate sales report (Admin only)
  async generateSalesReport(req, res) {
    try {
      const { period = 'monthly', start_date, end_date } = req.query;
      
      let dateFilter = '';
      const params = [];
      
      if (start_date && end_date) {
        dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
        params.push(start_date, end_date);
      }

      // Get sales data
      const salesResult = await query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          SUM(final_amount) as total_revenue,
          COUNT(DISTINCT customer_email) as unique_customers,
          COALESCE(SUM(loyalty_points_earned), 0) as total_loyalty_points_earned,
          COALESCE(SUM(loyalty_points_used), 0) as total_loyalty_points_used
        FROM store_orders 
        ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30`,
        params
      );

      // Get top selling products (handle case where no orders exist)
      let topProductsResult;
      try {
        topProductsResult = await query(
          `SELECT 
            si.id,
            si.name,
            COALESCE(SUM(soi.quantity), 0) as quantity_sold,
            COALESCE(SUM(soi.quantity * soi.price_at_time), 0) as revenue
          FROM store_items si
          LEFT JOIN store_order_items soi ON si.id = soi.item_id
          LEFT JOIN store_orders so ON soi.order_id = so.id
          ${dateFilter ? `AND so.created_at BETWEEN $${params.length + 1} AND $${params.length + 2}` : ''}
          WHERE si.is_active = true
          GROUP BY si.id, si.name
          ORDER BY quantity_sold DESC
          LIMIT 10`,
          start_date && end_date ? [...params, start_date, end_date] : []
        );
      } catch (error) {
        console.error('Error getting top products:', error);
        topProductsResult = { rows: [] };
      }

      // Get low stock items
      const lowStockResult = await query(
        `SELECT 
          si.id,
          si.name,
          si.stock_quantity as current_stock,
          si.low_stock_threshold as threshold
        FROM store_items si
        WHERE si.stock_quantity <= si.low_stock_threshold
        ORDER BY si.stock_quantity ASC
        LIMIT 10`
      );

      const totalOrders = salesResult.rows.reduce((sum, row) => sum + parseInt(row.total_orders || 0), 0);
      const totalRevenue = salesResult.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Format revenue by period
      const revenueByPeriod = salesResult.rows.map(row => ({
        period: row.date,
        revenue: parseFloat(row.total_revenue || 0),
        orders: parseInt(row.total_orders || 0)
      }));

      res.json({
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: averageOrderValue,
        top_selling_products: topProductsResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          quantity_sold: parseInt(row.quantity_sold || 0),
          revenue: parseFloat(row.revenue || 0)
        })),
        revenue_by_period: revenueByPeriod,
        low_stock_items: lowStockResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          current_stock: parseInt(row.current_stock),
          threshold: parseInt(row.threshold)
        }))
      });
    } catch (error) {
      console.error('Error generating sales report:', error);
      res.status(500).json({ error: 'Failed to generate sales report' });
    }
  }

  // Generate inventory report (Admin only)
  async generateInventoryReport(req, res) {
    try {
      const result = await query(
        `SELECT 
          si.id, si.name, si.stock_quantity, si.low_stock_threshold,
          sc.name as category_name,
          si.rating, si.review_count, si.wishlist_count,
          CASE 
            WHEN si.stock_quantity = 0 THEN 'out_of_stock'
            WHEN si.stock_quantity <= si.low_stock_threshold THEN 'low_stock'
            ELSE 'in_stock'
          END as stock_status
        FROM store_items si
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE si.is_active = true
        ORDER BY si.stock_quantity ASC`
      );

      const summary = {
        total_items: result.rows.length,
        out_of_stock: result.rows.filter(item => item.stock_status === 'out_of_stock').length,
        low_stock: result.rows.filter(item => item.stock_status === 'low_stock').length,
        in_stock: result.rows.filter(item => item.stock_status === 'in_stock').length
      };

      res.json({
        summary,
        items: result.rows
      });
    } catch (error) {
      console.error('Error generating inventory report:', error);
      res.status(500).json({ error: 'Failed to generate inventory report' });
    }
  }

  // Create promotion (Admin only)
  async createPromotion(req, res) {
    try {
      const {
        code, name, description, discount_type, discount_value,
        min_order_amount, max_discount_amount, usage_limit,
        is_member_only, valid_until
      } = req.body;

      if (!code || !name || !discount_type || !discount_value) {
        return res.status(400).json({ error: 'Code, name, discount type, and discount value are required' });
      }

      const result = await query(
        `INSERT INTO store_promotions (
          code, name, description, discount_type, discount_value,
          min_order_amount, max_discount_amount, usage_limit,
          is_member_only, valid_until, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          code, name, description, discount_type, discount_value,
          min_order_amount || 0, max_discount_amount, usage_limit || 1,
          is_member_only || false, valid_until, req.user?.id
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Promotion code already exists' });
      }
      console.error('Error creating promotion:', error);
      res.status(500).json({ error: 'Failed to create promotion' });
    }
  }

  // Get all promotions (Admin only)
  async getAllPromotions(req, res) {
    try {
      const result = await query(
        'SELECT * FROM store_promotions ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ error: 'Failed to fetch promotions' });
    }
  }

  // Update promotion (Admin only)
  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const updateFields = req.body;

      const result = await query(
        `UPDATE store_promotions 
         SET 
           name = COALESCE($1, name),
           description = COALESCE($2, description),
           discount_value = COALESCE($3, discount_value),
           min_order_amount = COALESCE($4, min_order_amount),
           max_discount_amount = COALESCE($5, max_discount_amount),
           usage_limit = COALESCE($6, usage_limit),
           is_member_only = COALESCE($7, is_member_only),
           is_active = COALESCE($8, is_active),
           valid_until = COALESCE($9, valid_until),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 RETURNING *`,
        [
          updateFields.name, updateFields.description, updateFields.discount_value,
          updateFields.min_order_amount, updateFields.max_discount_amount,
          updateFields.usage_limit, updateFields.is_member_only, updateFields.is_active,
          updateFields.valid_until, id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({ error: 'Failed to update promotion' });
    }
  }

  // Process refund (Admin only)
  async processRefund(req, res) {
    try {
      const { order_id } = req.params;
      const { refund_amount, refund_reason, refund_method, admin_notes } = req.body;

      if (!refund_amount || !refund_reason || !refund_method) {
        return res.status(400).json({ error: 'Refund amount, reason, and method are required' });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Get order details
        const orderResult = await client.query(
          'SELECT * FROM store_orders WHERE id = $1',
          [order_id]
        );

        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        if (refund_amount > order.final_amount) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Refund amount cannot exceed order amount' });
        }

        // Create refund record
        const refundResult = await client.query(
          `INSERT INTO store_refunds (
            order_id, refund_amount, refund_reason, refund_method,
            refund_status, processed_by, admin_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [order_id, refund_amount, refund_reason, refund_method, 'approved', req.user?.id, admin_notes]
        );

        // Update order with refund information
        await client.query(
          `UPDATE store_orders 
           SET refund_amount = $1, refund_reason = $2, refunded_at = CURRENT_TIMESTAMP, refunded_by = $3
           WHERE id = $4`,
          [refund_amount, refund_reason, req.user?.id, order_id]
        );

        await client.query('COMMIT');

        res.json({
          message: 'Refund processed successfully',
          refund: refundResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  }

  // Get low stock alerts (Admin only)
  async getLowStockAlerts(req, res) {
    try {
      const result = await query(
        `SELECT 
          si.id, si.name, si.stock_quantity, si.low_stock_threshold,
          sc.name as category_name
        FROM store_items si
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE si.is_active = true 
          AND si.stock_quantity <= si.low_stock_threshold
        ORDER BY si.stock_quantity ASC`
      );

      res.json({
        count: result.rows.length,
        alerts: result.rows
      });
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      res.status(500).json({ error: 'Failed to fetch low stock alerts' });
    }
  }

  // ==============================================
  // MEMBER FEATURES
  // ==============================================

  // Get member's order history
  async getMemberOrderHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's email for fallback matching
      const userResult = await query(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userEmail = userResult.rows[0].email;

      const result = await query(
        `SELECT 
          so.*, 
          COUNT(soi.id) as item_count
        FROM store_orders so
        LEFT JOIN store_order_items soi ON so.id = soi.order_id
        WHERE (
          so.cart_id IN (
            SELECT id FROM store_carts WHERE user_id = $1
          )
          OR (so.cart_id IS NULL AND so.customer_email = $2)
        )
        GROUP BY so.id
        ORDER BY so.created_at DESC`,
        [userId, userEmail]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching member order history:', error);
      res.status(500).json({ error: 'Failed to fetch order history' });
    }
  }

  // Add item to wishlist (Member only)
  async addToWishlist(req, res) {
    try {
      const userId = req.user?.id;
      const { item_id } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!item_id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      const result = await query(
        'INSERT INTO store_wishlists (user_id, item_id) VALUES ($1, $2) RETURNING *',
        [userId, item_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Item already in wishlist' });
      }
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  }

  // Remove item from wishlist (Member only)
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user?.id;
      const { item_id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await query(
        'DELETE FROM store_wishlists WHERE user_id = $1 AND item_id = $2 RETURNING *',
        [userId, item_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found in wishlist' });
      }

      res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  }

  // Get member's wishlist
  async getWishlist(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await query(
        `SELECT 
          sw.*, si.name, si.price, si.image_url, si.rating, si.review_count,
          sc.name as category_name
        FROM store_wishlists sw
        JOIN store_items si ON sw.item_id = si.id
        LEFT JOIN store_categories sc ON si.category_id = sc.id
        WHERE sw.user_id = $1 AND si.is_active = true
        ORDER BY sw.added_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  }

  // Add product review (Member or Guest)
  async addReview(req, res) {
    try {
      const { item_id, rating, review_text } = req.body;
      const userId = req.user?.id;

      if (!item_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Valid item ID and rating (1-5) are required' });
      }

      let reviewData;
      if (userId) {
        // Member review
        reviewData = {
          item_id, rating, review_text, user_id: userId, is_verified_purchase: true
        };
      } else {
        // Guest review
        const { guest_name, guest_email } = req.body;
        if (!guest_name || !guest_email) {
          return res.status(400).json({ error: 'Guest name and email are required' });
        }
        reviewData = {
          item_id, rating, review_text, guest_name, guest_email, is_verified_purchase: false
        };
      }

      const result = await query(
        `INSERT INTO store_reviews (
          item_id, user_id, guest_name, guest_email, rating, review_text, is_verified_purchase
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          reviewData.item_id, reviewData.user_id, reviewData.guest_name,
          reviewData.guest_email, reviewData.rating, reviewData.review_text,
          reviewData.is_verified_purchase
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  }

  // Get product reviews
  async getProductReviews(req, res) {
    try {
      const { item_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const result = await query(
        `SELECT 
          sr.*, 
          CASE 
            WHEN u.id IS NOT NULL THEN CONCAT(u.first_name, ' ', u.last_name)
            ELSE sr.guest_name
          END as user_name
        FROM store_reviews sr
        LEFT JOIN users u ON sr.user_id = u.id
        WHERE sr.item_id = $1 AND sr.is_approved = true
        ORDER BY sr.created_at DESC
        LIMIT $2 OFFSET $3`,
        [item_id, limit, offset]
      );

      const countResult = await query(
        'SELECT COUNT(*) as total FROM store_reviews WHERE item_id = $1 AND is_approved = true',
        [item_id]
      );

      res.json({
        reviews: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(countResult.rows[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ error: 'Failed to fetch product reviews' });
    }
  }

  // ==============================================
  // LOYALTY POINTS INTEGRATION
  // ==============================================

  // Get member's loyalty points balance
  async getLoyaltyPointsBalance(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await query(
        'SELECT loyalty_points FROM member_profiles WHERE user_id = $1',
        [userId]
      );

      const loyaltyPoints = result.rows[0]?.loyalty_points || 0;

      res.json({
        loyalty_points: loyaltyPoints,
        points_value: loyaltyPoints * 0.01 // $0.01 per point
      });
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      res.status(500).json({ error: 'Failed to fetch loyalty points' });
    }
  }

  // Apply loyalty points to cart
  async applyLoyaltyPoints(req, res) {
    try {
      const userId = req.user?.id;
      const { cart_id, points_to_use } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!points_to_use || points_to_use <= 0) {
        return res.status(400).json({ error: 'Valid points amount is required' });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Get member's loyalty points
        const memberResult = await client.query(
          'SELECT loyalty_points FROM member_profiles WHERE user_id = $1',
          [userId]
        );

        const availablePoints = memberResult.rows[0]?.loyalty_points || 0;

        if (points_to_use > availablePoints) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient loyalty points' });
        }

        // Calculate discount value (1 point = $0.01)
        const discountValue = points_to_use * 0.01;

        // Update cart items with loyalty points discount
        await client.query(
          `UPDATE store_cart_items 
           SET loyalty_points_discount_applied = $1
           WHERE cart_id = $2`,
          [discountValue, cart_id]
        );

        await client.query('COMMIT');

        res.json({
          message: 'Loyalty points applied successfully',
          points_used: points_to_use,
          discount_value: discountValue
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error applying loyalty points:', error);
      res.status(500).json({ error: 'Failed to apply loyalty points' });
    }
  }

  // ==============================================
  // PROMOTIONAL CODES
  // ==============================================

  // Validate promotional code
  async validatePromotionalCode(req, res) {
    try {
      const { code, cart_total, is_member = false } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Promotional code is required' });
      }

      const result = await query(
        `SELECT * FROM store_promotions 
         WHERE code = $1 
           AND is_active = true 
           AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
           AND used_count < usage_limit`,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invalid or expired promotional code' });
      }

      const promotion = result.rows[0];

      // Check if member-only promotion
      if (promotion.is_member_only && !is_member) {
        return res.status(400).json({ error: 'This promotion is for members only' });
      }

      // Check minimum order amount
      if (cart_total < promotion.min_order_amount) {
        return res.status(400).json({ 
          error: `Minimum order amount of $${promotion.min_order_amount} required` 
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (promotion.discount_type === 'percentage') {
        discountAmount = (cart_total * promotion.discount_value) / 100;
        if (promotion.max_discount_amount) {
          discountAmount = Math.min(discountAmount, promotion.max_discount_amount);
        }
      } else {
        discountAmount = promotion.discount_value;
      }

      res.json({
        promotion: {
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          discount_amount: discountAmount
        }
      });
    } catch (error) {
      console.error('Error validating promotional code:', error);
      res.status(500).json({ error: 'Failed to validate promotional code' });
    }
  }

  // ==============================================
  // ENHANCED CHECKOUT WITH LOYALTY POINTS AND PROMOTIONS
  // ==============================================

  // Enhanced checkout method
  async enhancedCheckout(req, res) {
    try {
      const {
        cart_id, customer_name, customer_email, customer_phone,
        payment_method, pickup_notes, promotional_code, loyalty_points_to_use
      } = req.body;

      if (!cart_id || !customer_name || !customer_email || !payment_method) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Get cart and items
        const cartResult = await client.query(
          'SELECT * FROM store_carts WHERE id = $1',
          [cart_id]
        );

        if (cartResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Cart not found' });
        }

        const cart = cartResult.rows[0];

        // Get cart items with current stock
        const cartItemsResult = await client.query(
          `SELECT 
            sci.*, si.name, si.price, si.member_discount_percentage, si.stock_quantity,
            si.min_loyalty_points_required
          FROM store_cart_items sci
          JOIN store_items si ON sci.item_id = si.id
          WHERE sci.cart_id = $1`,
          [cart_id]
        );

        if (cartItemsResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Cart is empty' });
        }

        // Check stock and loyalty points requirements
        let totalAmount = 0;
        let memberDiscountTotal = 0;
        let promotionalDiscount = 0;
        let loyaltyPointsDiscount = 0;
        const orderItems = [];

        for (const item of cartItemsResult.rows) {
          if (item.stock_quantity < item.quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
              error: `Insufficient stock for ${item.name}` 
            });
          }

          const itemTotal = item.price * item.quantity;
          const memberDiscount = (item.price * item.member_discount_percentage / 100) * item.quantity;
          
          totalAmount += itemTotal;
          memberDiscountTotal += memberDiscount;
          
          orderItems.push({
            item_id: item.item_id,
            quantity: item.quantity,
            price_at_time: item.price,
            member_discount_applied: memberDiscount,
            subtotal: itemTotal - memberDiscount
          });
        }

        // Apply promotional code if provided
        if (promotional_code) {
          const promoResult = await client.query(
            `SELECT * FROM store_promotions 
             WHERE code = $1 
               AND is_active = true 
               AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
               AND used_count < usage_limit`,
            [promotional_code]
          );

          if (promoResult.rows.length > 0) {
            const promotion = promoResult.rows[0];
            const subtotalAfterMemberDiscount = totalAmount - memberDiscountTotal;

            if (promotion.discount_type === 'percentage') {
              promotionalDiscount = (subtotalAfterMemberDiscount * promotion.discount_value) / 100;
              if (promotion.max_discount_amount) {
                promotionalDiscount = Math.min(promotionalDiscount, promotion.max_discount_amount);
              }
            } else {
              promotionalDiscount = promotion.discount_value;
            }
          }
        }

        // Apply loyalty points if provided
        if (loyalty_points_to_use && loyalty_points_to_use > 0) {
          const memberResult = await client.query(
            'SELECT loyalty_points FROM member_profiles WHERE user_id = $1',
            [cart.user_id]
          );

          const availablePoints = memberResult.rows[0]?.loyalty_points || 0;
          if (loyalty_points_to_use <= availablePoints) {
            loyaltyPointsDiscount = loyalty_points_to_use * 0.01; // $0.01 per point
          }
        }

        const finalAmount = totalAmount - memberDiscountTotal - promotionalDiscount - loyaltyPointsDiscount;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order
        const orderResult = await client.query(
          `INSERT INTO store_orders (
            cart_id, order_number, customer_name, customer_email, customer_phone,
            total_amount, member_discount_total, final_amount, payment_method,
            pickup_notes, promotional_code, promotional_discount,
            loyalty_points_used, loyalty_points_value
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
          [
            cart_id, orderNumber, customer_name, customer_email, customer_phone,
            totalAmount, memberDiscountTotal, finalAmount, payment_method,
            pickup_notes, promotional_code, promotionalDiscount,
            loyalty_points_to_use || 0, loyaltyPointsDiscount
          ]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO store_order_items (
              order_id, item_id, quantity, price_at_time, member_discount_applied, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [order.id, item.item_id, item.quantity, item.price_at_time, item.member_discount_applied, item.subtotal]
          );
        }

        // Update inventory
        for (const item of cartItemsResult.rows) {
          const newStock = item.stock_quantity - item.quantity;
          
          await client.query(
            'UPDATE store_items SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newStock, item.item_id]
          );

          // Record inventory transaction
          await client.query(
            `INSERT INTO store_inventory_transactions (
              item_id, transaction_type, quantity, previous_stock, new_stock,
              reference_type, reference_id, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              item.item_id, 'stock_out', item.quantity,
              item.stock_quantity, newStock,
              'order', order.id, `Order ${orderNumber}`
            ]
          );
        }

        // Update member profile if applicable
        if (cart.user_id) {
          await client.query(
            `UPDATE member_profiles 
             SET 
               total_store_purchases = total_store_purchases + 1,
               total_store_spent = total_store_spent + $1,
               last_store_purchase_date = CURRENT_TIMESTAMP
             WHERE user_id = $2`,
            [finalAmount, cart.user_id]
          );

          // Earn loyalty points (1 point per $1 spent)
          const pointsEarned = Math.floor(finalAmount);
          if (pointsEarned > 0) {
            await client.query(
              `UPDATE member_profiles 
               SET loyalty_points = loyalty_points + $1
               WHERE user_id = $2`,
              [pointsEarned, cart.user_id]
            );

            // Record loyalty transaction
            await client.query(
              `INSERT INTO loyalty_transactions (
                user_id, points_change, transaction_type, description, reference_id
              ) VALUES ($1, $2, $3, $4, $5)`,
              [cart.user_id, pointsEarned, 'purchase', `Store purchase - Order ${orderNumber}`, order.id]
            );
          }

          // Use loyalty points if applicable
          if (loyalty_points_to_use && loyalty_points_to_use > 0) {
            await client.query(
              `UPDATE member_profiles 
               SET loyalty_points = loyalty_points - $1
               WHERE user_id = $2`,
              [loyalty_points_to_use, cart.user_id]
            );

            // Record loyalty transaction
            await client.query(
              `INSERT INTO loyalty_transactions (
                user_id, points_change, transaction_type, description, reference_id
              ) VALUES ($1, $2, $3, $4, $5)`,
              [cart.user_id, -loyalty_points_to_use, 'redemption', `Store purchase - Order ${orderNumber}`, order.id]
            );
          }
        }

        // Clear cart
        await client.query('DELETE FROM store_cart_items WHERE cart_id = $1', [cart_id]);
        await client.query('DELETE FROM store_carts WHERE id = $1', [cart_id]);

        // Add order status history
        await client.query(
          `INSERT INTO store_order_status_history (
            order_id, status, notes, changed_by
          ) VALUES ($1, $2, $3, $4)`,
          [order.id, 'pending', 'Order created', null]
        );

        await client.query('COMMIT');

        res.status(201).json({
          message: 'Order placed successfully',
          order: {
            id: order.id,
            order_number: order.order_number,
            final_amount: order.final_amount,
            status: order.order_status
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error in enhanced checkout:', error);
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  }
}

export default new StoreController();
