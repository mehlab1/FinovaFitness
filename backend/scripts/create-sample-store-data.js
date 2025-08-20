import { query, getClient } from '../src/database.js';

async function createSampleStoreData() {
  const client = await getClient();
  
  try {
    console.log('🚀 Creating sample store data...');
    
    // Get category IDs
    const categoriesResult = await client.query('SELECT id, name FROM store_categories');
    const categories = categoriesResult.rows;
    
    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the store schema migration first.');
      return;
    }
    
    console.log(`📦 Found ${categories.length} categories`);
    
    // Sample items data
    const sampleItems = [
      // Supplements
      {
        category_id: categories.find(c => c.name === 'Supplements')?.id,
        name: 'Whey Protein Powder',
        description: 'High-quality whey protein isolate, 30g protein per serving. Perfect for post-workout recovery and muscle building.',
        price: 89.99,
        member_discount_percentage: 15.0,
        stock_quantity: 50,
        low_stock_threshold: 10,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Supplements')?.id,
        name: 'Pre-Workout Energy Blend',
        description: 'Advanced pre-workout formula with caffeine, creatine, and BCAAs for maximum performance and focus.',
        price: 45.99,
        member_discount_percentage: 10.0,
        stock_quantity: 30,
        low_stock_threshold: 8,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Supplements')?.id,
        name: 'Multivitamin Complex',
        description: 'Complete daily multivitamin with minerals and antioxidants for overall health and wellness.',
        price: 32.99,
        member_discount_percentage: 20.0,
        stock_quantity: 75,
        low_stock_threshold: 15,
        image_url: null
      },
      
      // Gym Accessories
      {
        category_id: categories.find(c => c.name === 'Gym Accessories')?.id,
        name: 'Lifting Straps',
        description: 'Heavy-duty cotton lifting straps for better grip during deadlifts and heavy pulls.',
        price: 24.99,
        member_discount_percentage: 12.0,
        stock_quantity: 40,
        low_stock_threshold: 12,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Gym Accessories')?.id,
        name: 'Weight Lifting Belt',
        description: 'Premium leather weightlifting belt with steel buckle for maximum support during heavy lifts.',
        price: 79.99,
        member_discount_percentage: 18.0,
        stock_quantity: 25,
        low_stock_threshold: 8,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Gym Accessories')?.id,
        name: 'Gym Gloves',
        description: 'Comfortable padded gym gloves with grip enhancement for better bar control.',
        price: 19.99,
        member_discount_percentage: 15.0,
        stock_quantity: 60,
        low_stock_threshold: 20,
        image_url: null
      },
      
      // Equipment
      {
        category_id: categories.find(c => c.name === 'Equipment')?.id,
        name: 'Resistance Bands Set',
        description: 'Complete set of 5 resistance bands with different resistance levels for versatile workouts.',
        price: 34.99,
        member_discount_percentage: 25.0,
        stock_quantity: 35,
        low_stock_threshold: 10,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Equipment')?.id,
        name: 'Yoga Mat',
        description: 'Premium non-slip yoga mat with carrying strap, perfect for yoga, pilates, and floor exercises.',
        price: 49.99,
        member_discount_percentage: 20.0,
        stock_quantity: 45,
        low_stock_threshold: 15,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Equipment')?.id,
        name: 'Foam Roller',
        description: 'High-density foam roller for muscle recovery, myofascial release, and improved flexibility.',
        price: 29.99,
        member_discount_percentage: 15.0,
        stock_quantity: 30,
        low_stock_threshold: 10,
        image_url: null
      },
      
      // Apparel
      {
        category_id: categories.find(c => c.name === 'Apparel')?.id,
        name: 'Performance T-Shirt',
        description: 'Moisture-wicking performance t-shirt made from breathable fabric for maximum comfort during workouts.',
        price: 39.99,
        member_discount_percentage: 22.0,
        stock_quantity: 55,
        low_stock_threshold: 18,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Apparel')?.id,
        name: 'Workout Shorts',
        description: 'Comfortable athletic shorts with built-in liner and side pockets for convenience.',
        price: 44.99,
        member_discount_percentage: 20.0,
        stock_quantity: 40,
        low_stock_threshold: 12,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Apparel')?.id,
        name: 'Training Shoes',
        description: 'Versatile training shoes with excellent stability and support for all types of workouts.',
        price: 129.99,
        member_discount_percentage: 30.0,
        stock_quantity: 20,
        low_stock_threshold: 6,
        image_url: null
      },
      
      // Recovery
      {
        category_id: categories.find(c => c.name === 'Recovery')?.id,
        name: 'Massage Gun',
        description: 'Professional-grade percussion massage gun with multiple speed settings for deep tissue therapy.',
        price: 199.99,
        member_discount_percentage: 25.0,
        stock_quantity: 15,
        low_stock_threshold: 5,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Recovery')?.id,
        name: 'Compression Sleeves',
        description: 'Knee and elbow compression sleeves for joint support and improved blood circulation.',
        price: 27.99,
        member_discount_percentage: 18.0,
        stock_quantity: 50,
        low_stock_threshold: 15,
        image_url: null
      },
      
      // Nutrition
      {
        category_id: categories.find(c => c.name === 'Nutrition')?.id,
        name: 'Protein Bars (12-pack)',
        description: 'Delicious protein bars with 20g protein, low sugar, and great taste. Perfect for on-the-go nutrition.',
        price: 36.99,
        member_discount_percentage: 20.0,
        stock_quantity: 40,
        low_stock_threshold: 12,
        image_url: null
      },
      {
        category_id: categories.find(c => c.name === 'Nutrition')?.id,
        name: 'BCAA Powder',
        description: 'Branched-chain amino acid powder with electrolytes for muscle recovery and hydration.',
        price: 28.99,
        member_discount_percentage: 15.0,
        stock_quantity: 35,
        low_stock_threshold: 10,
        image_url: null
      }
    ];
    
    console.log(`🛍️  Creating ${sampleItems.length} sample items...`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const item of sampleItems) {
      try {
        // Check if item already exists
        const existingItem = await client.query(
          'SELECT id FROM store_items WHERE name = $1',
          [item.name]
        );
        
        if (existingItem.rows.length > 0) {
          console.log(`⚠️  Item "${item.name}" already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Insert item
        await client.query(
          `INSERT INTO store_items (
            category_id, name, description, price, member_discount_percentage,
            stock_quantity, low_stock_threshold, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            item.category_id, item.name, item.description, item.price,
            item.member_discount_percentage, item.stock_quantity,
            item.low_stock_threshold, item.image_url
          ]
        );
        
        console.log(`✅ Created: ${item.name} - $${item.price}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating item "${item.name}":`, error.message);
      }
    }
    
    console.log(`\n🎉 Sample data creation completed!`);
    console.log(`✅ Created: ${createdCount} items`);
    console.log(`⚠️  Skipped: ${skippedCount} items (already existed)`);
    
    // Display inventory summary
    console.log(`\n📊 Inventory Summary:`);
    const inventoryResult = await client.query(`
      SELECT 
        sc.name as category,
        COUNT(si.id) as item_count,
        SUM(si.stock_quantity) as total_stock,
        AVG(si.price) as avg_price
      FROM store_categories sc
      LEFT JOIN store_items si ON sc.id = si.category_id
      GROUP BY sc.id, sc.name
      ORDER BY sc.name
    `);
    
    inventoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.item_count} items, ${row.total_stock || 0} total stock, $${parseFloat(row.avg_price || 0).toFixed(2)} avg price`);
    });
    
  } catch (error) {
    console.error('💥 Error creating sample store data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleStoreData()
    .then(() => {
      console.log('🎯 Sample store data creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Sample store data creation failed:', error);
      process.exit(1);
    });
}

export default createSampleStoreData;
