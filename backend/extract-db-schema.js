import { query } from './src/config/database.js';

async function extractDatabaseSchema() {
  try {
    console.log('🔍 Extracting database schema from connected database...\n');

    // Get all tables in the database
    const tablesResult = await query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows;
    console.log(`📋 Found ${tables.length} tables in the database:\n`);

    let schemaDocumentation = `# Finova Fitness - Complete Database Schema Documentation

This document contains the complete database schema extracted from the actual connected PostgreSQL database.

## Database Overview
- **Database Type**: PostgreSQL (Neon)
- **Total Tables**: ${tables.length}
- **Extraction Date**: ${new Date().toISOString()}

## Table Structure

`;

    // Process each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📊 Processing table: ${tableName}`);

      // Get table columns
      const columnsResult = await query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Get table constraints
      const constraintsResult = await query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          ccu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
        AND tc.table_name = $1
        ORDER BY tc.constraint_type, tc.constraint_name
      `, [tableName]);

      // Get foreign key relationships
      const foreignKeysResult = await query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
        ORDER BY kcu.column_name
      `, [tableName]);

      // Get indexes
      const indexesResult = await query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1
        AND schemaname = 'public'
        ORDER BY indexname
      `, [tableName]);

      // Get table comments
      const commentsResult = await query(`
        SELECT 
          col_description(c.oid, cols.ordinal_position) as column_comment
        FROM pg_class c
        JOIN information_schema.columns cols 
          ON c.relname = cols.table_name
        WHERE c.relname = $1
        AND cols.table_schema = 'public'
        ORDER BY cols.ordinal_position
      `, [tableName]);

      // Build table documentation
      schemaDocumentation += `### ${tableName}\n\n`;

      // Add columns section
      schemaDocumentation += `#### Columns\n\n`;
      schemaDocumentation += `| Column Name | Data Type | Nullable | Default | Description |\n`;
      schemaDocumentation += `|-------------|-----------|----------|---------|-------------|\n`;

      columnsResult.rows.forEach((column, index) => {
        const comment = commentsResult.rows[index]?.column_comment || '';
        const dataType = column.data_type === 'character varying' 
          ? `VARCHAR(${column.character_maximum_length})`
          : column.data_type === 'numeric'
          ? `DECIMAL(${column.numeric_precision}, ${column.numeric_scale})`
          : column.data_type.toUpperCase();
        
        schemaDocumentation += `| ${column.column_name} | ${dataType} | ${column.is_nullable === 'YES' ? 'YES' : 'NO'} | ${column.column_default || 'NULL'} | ${comment} |\n`;
      });

      schemaDocumentation += '\n';

      // Add constraints section
      if (constraintsResult.rows.length > 0) {
        schemaDocumentation += `#### Constraints\n\n`;
        constraintsResult.rows.forEach(constraint => {
          schemaDocumentation += `- **${constraint.constraint_name}**: ${constraint.constraint_type} on ${constraint.column_name}\n`;
        });
        schemaDocumentation += '\n';
      }

      // Add foreign keys section
      if (foreignKeysResult.rows.length > 0) {
        schemaDocumentation += `#### Foreign Keys\n\n`;
        foreignKeysResult.rows.forEach(fk => {
          schemaDocumentation += `- **${fk.column_name}** → **${fk.foreign_table_name}.${fk.foreign_column_name}** (ON DELETE: ${fk.delete_rule}, ON UPDATE: ${fk.update_rule})\n`;
        });
        schemaDocumentation += '\n';
      }

      // Add indexes section
      if (indexesResult.rows.length > 0) {
        schemaDocumentation += `#### Indexes\n\n`;
        indexesResult.rows.forEach(index => {
          schemaDocumentation += `- **${index.indexname}**: ${index.indexdef}\n`;
        });
        schemaDocumentation += '\n';
      }

      schemaDocumentation += `---\n\n`;
    }

    // Add relationships diagram
    schemaDocumentation += `## Database Relationships\n\n`;
    schemaDocumentation += `### Entity Relationship Overview\n\n`;

    // Get all foreign key relationships across the database
    const allRelationshipsResult = await query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);

    schemaDocumentation += `| Table | Foreign Key | References |\n`;
    schemaDocumentation += `|-------|-------------|------------|\n`;

    allRelationshipsResult.rows.forEach(rel => {
      schemaDocumentation += `| ${rel.table_name} | ${rel.column_name} | ${rel.foreign_table_name}.${rel.foreign_column_name} |\n`;
    });

    schemaDocumentation += '\n';

    // Add table categories
    schemaDocumentation += `## Table Categories\n\n`;

    const tableCategories = {
      'User Management': ['users', 'deleted_users', 'member_profiles'],
      'Trainer System': ['trainers', 'trainer_availability', 'trainer_time_off', 'trainer_monthly_plans', 'trainer_master_slots', 'trainer_monthly_stats', 'trainer_ratings', 'trainer_revenue'],
      'Booking System': ['bookings', 'booking_reviews', 'training_sessions', 'session_notes', 'training_requests'],
      'Class Management': ['classes', 'class_schedules'],
      'Membership & Plans': ['membership_plans', 'client_trainer_subscriptions', 'monthly_plan_subscriptions', 'slot_assignments', 'monthly_plan_session_assignments'],
      'Workout & Exercise': ['workout_logs', 'exercise_logs', 'muscle_groups', 'exercises', 'member_workout_schedules', 'schedule_muscle_groups', 'schedule_exercises', 'weight_tracking'],
      'Facilities': ['facilities', 'facility_schedules', 'facility_pricing', 'facility_slots', 'facility_bookings', 'facility_availability_exceptions', 'facility_waitlist', 'facility_analytics', 'cancellation_policies'],
      'Store System': ['store_categories', 'store_items', 'store_carts', 'store_cart_items', 'store_orders', 'store_order_items', 'store_order_status_history', 'store_inventory_transactions'],
      'Loyalty & Referrals': ['referrals', 'loyalty_transactions', 'member_invites', 'gym_visits'],
      'Nutrition': ['nutrition_consultations', 'diet_plan_requests'],
      'Equipment': ['equipment'],
      'Payments': ['payments'],
      'Revenue Tracking': ['gym_revenue', 'membership_revenue', 'training_revenue', 'class_revenue', 'daily_revenue_summary', 'monthly_revenue_summary', 'revenue_source_summary'],
      'Member Balance': ['member_balance', 'member_balance_transactions', 'plan_change_requests'],
      'Slot Management': ['slot_generation_batches'],
      'Client Progress': ['client_progress'],
      'Session Packages': ['session_packages']
    };

    Object.entries(tableCategories).forEach(([category, tableList]) => {
      const existingTables = tableList.filter(table => 
        tables.some(t => t.table_name === table)
      );
      
      if (existingTables.length > 0) {
        schemaDocumentation += `### ${category}\n\n`;
        existingTables.forEach(table => {
          schemaDocumentation += `- **${table}**\n`;
        });
        schemaDocumentation += '\n';
      }
    });

    // Add schema files reference
    schemaDocumentation += `## Schema Files Reference\n\n`;
    schemaDocumentation += `The database schema is defined in the following files:\n\n`;
    schemaDocumentation += `- **Main Schema**: \`backend/src/schema.sql\` - Core tables for users, trainers, classes, bookings\n`;
    schemaDocumentation += `- **Store System**: \`backend/complete-store-schema.sql\` - Online store tables\n`;
    schemaDocumentation += `- **Monthly Plans**: \`backend/src/database/schemas/monthly-plan-system.sql\` - Trainer monthly subscription system\n`;
    schemaDocumentation += `- **Facilities**: \`backend/src/database/schemas/facilities-system.sql\` - Facility booking system\n`;
    schemaDocumentation += `- **Revenue System**: \`backend/src/database/schemas/gym-revenue.sql\` - Revenue tracking\n`;
    schemaDocumentation += `- **Member Balance**: \`backend/src/database/schemas/member-balance.sql\` - Member balance system\n`;
    schemaDocumentation += `- **Diet Plans**: \`backend/src/database/migrations/add-diet-plan-requests-table.sql\` - Diet plan requests\n`;
    schemaDocumentation += `- **Deleted Users**: \`backend/src/create-deleted-users-table.sql\` - User deletion tracking\n\n`;

    // Write to file
    const fs = await import('fs');
    fs.writeFileSync('COMPLETE_DATABASE_SCHEMA.md', schemaDocumentation);
    
    console.log('✅ Database schema documentation created successfully!');
    console.log('📄 File: COMPLETE_DATABASE_SCHEMA.md');
    console.log(`📊 Processed ${tables.length} tables with complete schema information`);

  } catch (error) {
    console.error('❌ Error extracting database schema:', error);
  }
}

// Run the extraction
extractDatabaseSchema();
