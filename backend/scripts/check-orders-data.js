import { query } from '../src/database.js';

async function checkOrdersData() {
  try {
    console.log('🔍 Checking orders and carts data...');
    
    // Get recent orders
    const ordersResult = await query(`
      SELECT 
        so.id,
        so.order_number,
        so.cart_id,
        so.customer_email,
        so.total_amount,
        so.order_status,
        so.created_at,
        sc.user_id as cart_user_id,
        sc.guest_email as cart_guest_email
      FROM store_orders so
      LEFT JOIN store_carts sc ON so.cart_id = sc.id
      ORDER BY so.created_at DESC
      LIMIT 10;
    `);
    
    console.log('\n📋 Recent orders:');
    ordersResult.rows.forEach(order => {
      console.log(`  Order ${order.order_number}:`);
      console.log(`    ID: ${order.id}, Cart ID: ${order.cart_id}`);
      console.log(`    Customer: ${order.customer_email}`);
      console.log(`    Cart User ID: ${order.cart_user_id}, Cart Guest: ${order.cart_guest_email}`);
      console.log(`    Status: ${order.order_status}, Amount: $${order.total_amount}`);
      console.log(`    Created: ${order.created_at}`);
      console.log('');
    });
    
    // Get carts
    const cartsResult = await query(`
      SELECT 
        id,
        user_id,
        guest_email,
        guest_name,
        created_at
      FROM store_carts
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    
    console.log('\n🛒 Recent carts:');
    cartsResult.rows.forEach(cart => {
      console.log(`  Cart ${cart.id}:`);
      console.log(`    User ID: ${cart.user_id}, Guest: ${cart.guest_email}`);
      console.log(`    Created: ${cart.created_at}`);
      console.log('');
    });
    
    // Check if there are any orders without proper cart linkage
    const orphanedOrdersResult = await query(`
      SELECT 
        so.id,
        so.order_number,
        so.cart_id,
        so.customer_email,
        so.created_at
      FROM store_orders so
      LEFT JOIN store_carts sc ON so.cart_id = sc.id
      WHERE sc.id IS NULL
      ORDER BY so.created_at DESC
      LIMIT 5;
    `);
    
    console.log('\n⚠️  Orders without valid cart linkage:');
    if (orphanedOrdersResult.rows.length === 0) {
      console.log('  ✅ All orders have valid cart linkage');
    } else {
      orphanedOrdersResult.rows.forEach(order => {
        console.log(`  Order ${order.order_number}: Cart ID ${order.cart_id} (not found)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the check
checkOrdersData()
  .then(() => {
    console.log('\n✅ Orders data check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Orders data check failed:', error);
    process.exit(1);
  });

export { checkOrdersData };
