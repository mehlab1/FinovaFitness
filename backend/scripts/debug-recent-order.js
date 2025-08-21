import { query } from '../src/database.js';

async function debugRecentOrder() {
  try {
    console.log('🔍 Debugging most recent order...');
    
    // Get the most recent order and see what cart_id was passed
    const orderResult = await query(`
      SELECT * FROM store_orders 
      ORDER BY created_at DESC 
      LIMIT 1;
    `);
    
    if (orderResult.rows.length === 0) {
      console.log('❌ No orders found');
      return;
    }
    
    const order = orderResult.rows[0];
    console.log('\n📋 Most recent order:');
    console.log(`  Order ID: ${order.id}`);
    console.log(`  Order Number: ${order.order_number}`);
    console.log(`  Cart ID: ${order.cart_id} (${order.cart_id === null ? 'NULL!' : 'valid'})`);
    console.log(`  Customer: ${order.customer_email}`);
    console.log(`  Amount: $${order.total_amount}`);
    console.log(`  Created: ${order.created_at}`);
    
    // Check if this cart exists
    if (order.cart_id) {
      const cartResult = await query(`
        SELECT * FROM store_carts WHERE id = $1;
      `, [order.cart_id]);
      
      console.log('\n🛒 Associated cart:');
      if (cartResult.rows.length > 0) {
        const cart = cartResult.rows[0];
        console.log(`  Cart ID: ${cart.id}`);
        console.log(`  User ID: ${cart.user_id}`);
        console.log(`  Guest Email: ${cart.guest_email}`);
        console.log(`  Created: ${cart.created_at}`);
      } else {
        console.log('  ❌ Cart not found!');
      }
    } else {
      console.log('\n🛒 Associated cart: NULL (This is the problem!)');
    }
    
    // Check order items
    const orderItemsResult = await query(`
      SELECT soi.*, si.name 
      FROM store_order_items soi
      JOIN store_items si ON soi.item_id = si.id
      WHERE soi.order_id = $1;
    `, [order.id]);
    
    console.log('\n📦 Order items:');
    orderItemsResult.rows.forEach(item => {
      console.log(`  ${item.name}: ${item.quantity} x $${item.price_at_time}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the debug
debugRecentOrder()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  });

export { debugRecentOrder };
