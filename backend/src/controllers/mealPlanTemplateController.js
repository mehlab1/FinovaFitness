import { query } from '../config/database.js';

// Get all meal plan templates for a nutritionist
export const getMealPlanTemplates = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    const result = await query(`
      SELECT 
        mpt.*,
        COUNT(mptm.id) as total_meals,
        COUNT(DISTINCT mptm.meal_type) as unique_meal_types
      FROM meal_plan_templates mpt
      LEFT JOIN meal_plan_template_meals mptm ON mpt.id = mptm.template_id
      WHERE mpt.nutritionist_id = $1 AND mpt.is_active = true
      GROUP BY mpt.id
      ORDER BY mpt.created_at DESC
    `, [nutritionistId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get meal plan templates error:', error);
    res.status(500).json({ error: 'Failed to get meal plan templates' });
  }
};

// Get a specific meal plan template with all details
export const getMealPlanTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const nutritionistId = req.userId;
    
    // Get template details
    const templateResult = await query(`
      SELECT * FROM meal_plan_templates 
      WHERE id = $1 AND nutritionist_id = $2 AND is_active = true
    `, [templateId, nutritionistId]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = templateResult.rows[0];
    
    // Get meals for this template
    const mealsResult = await query(`
      SELECT * FROM meal_plan_template_meals 
      WHERE template_id = $1 
      ORDER BY meal_order ASC
    `, [templateId]);
    
    const meals = mealsResult.rows;
    
    // Get foods for each meal
    for (let meal of meals) {
      const foodsResult = await query(`
        SELECT * FROM meal_plan_template_foods 
        WHERE meal_id = $1 
        ORDER BY food_name ASC
      `, [meal.id]);
      
      meal.foods = foodsResult.rows;
    }
    
    template.meals = meals;
    
    res.json(template);
  } catch (error) {
    console.error('Get meal plan template error:', error);
    res.status(500).json({ error: 'Failed to get meal plan template' });
  }
};

// Create a new meal plan template
export   const createMealPlanTemplate = async (req, res) => {
    try {
      const nutritionistId = req.userId;
      const {
        template_name,
        template_type,
        target_calories,
        target_protein,
        target_carbs,
        target_fats,
        target_fiber,
        target_sodium,
        target_sugar,
        meal_count,
        duration_weeks,
        difficulty_level,
        dietary_restrictions,
        fitness_goal,
        age_group,
        activity_level,
        description,
        instructions,
        tips_and_notes,
        is_public,
        meals
      } = req.body;

      // Sanitize numeric fields - convert empty strings to null and validate numbers
      const sanitizeNumericField = (value, fieldName) => {
        if (value === '' || value === null || value === undefined) {
          return null;
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error(`${fieldName} must be a valid number`);
        }
        return num;
      };

      const sanitizedData = {
        template_name,
        template_type,
        target_calories: sanitizeNumericField(target_calories, 'Target Calories'),
        target_protein: sanitizeNumericField(target_protein, 'Target Protein'),
        target_carbs: sanitizeNumericField(target_carbs, 'Target Carbs'),
        target_fats: sanitizeNumericField(target_fats, 'Target Fats'),
        target_fiber: sanitizeNumericField(target_fiber, 'Target Fiber'),
        target_sodium: sanitizeNumericField(target_sodium, 'Target Sodium'),
        target_sugar: sanitizeNumericField(target_sugar, 'Target Sugar'),
        meal_count: parseInt(meal_count) || 0,
        duration_weeks: parseInt(duration_weeks) || 1,
        difficulty_level,
        dietary_restrictions: dietary_restrictions || [],
        fitness_goal,
        age_group,
        activity_level,
        description,
        instructions,
        tips_and_notes,
        is_public: Boolean(is_public)
      };
    
    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Create template
      const templateResult = await query(`
        INSERT INTO meal_plan_templates (
          nutritionist_id, template_name, template_type, target_calories,
          target_protein, target_carbs, target_fats, target_fiber,
          target_sodium, target_sugar, meal_count, duration_weeks,
          difficulty_level, dietary_restrictions, fitness_goal, age_group,
          activity_level, description, instructions, tips_and_notes, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `, [
        nutritionistId, sanitizedData.template_name, sanitizedData.template_type, sanitizedData.target_calories,
        sanitizedData.target_protein, sanitizedData.target_carbs, sanitizedData.target_fats, sanitizedData.target_fiber,
        sanitizedData.target_sodium, sanitizedData.target_sugar, sanitizedData.meal_count, sanitizedData.duration_weeks,
        sanitizedData.difficulty_level, sanitizedData.dietary_restrictions, sanitizedData.fitness_goal, sanitizedData.age_group,
        sanitizedData.activity_level, sanitizedData.description, sanitizedData.instructions, sanitizedData.tips_and_notes, sanitizedData.is_public
      ]);
      
      const template = templateResult.rows[0];
      
      // Create meals if provided
      if (meals && Array.isArray(meals)) {
        for (let meal of meals) {
          // Sanitize meal data
          const sanitizedMeal = {
            meal_name: meal.meal_name || '',
            meal_type: meal.meal_type || 'Breakfast',
            meal_order: parseInt(meal.meal_order) || 1,
            target_calories: sanitizeNumericField(meal.target_calories, 'Meal Target Calories'),
            target_protein: sanitizeNumericField(meal.target_protein, 'Meal Target Protein'),
            target_carbs: sanitizeNumericField(meal.target_carbs, 'Meal Target Carbs'),
            target_fats: sanitizeNumericField(meal.target_fats, 'Meal Target Fats'),
            description: meal.description || '',
            preparation_time: parseInt(meal.preparation_time) || null,
            cooking_time: parseInt(meal.cooking_time) || null,
            difficulty: meal.difficulty || 'Easy'
          };

          const mealResult = await query(`
            INSERT INTO meal_plan_template_meals (
              template_id, meal_name, meal_type, meal_order,
              target_calories, target_protein, target_carbs, target_fats,
              description, preparation_time, cooking_time, difficulty
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
          `, [
            template.id, sanitizedMeal.meal_name, sanitizedMeal.meal_type, sanitizedMeal.meal_order,
            sanitizedMeal.target_calories, sanitizedMeal.target_protein, sanitizedMeal.target_carbs, sanitizedMeal.target_fats,
            sanitizedMeal.description, sanitizedMeal.preparation_time, sanitizedMeal.cooking_time, sanitizedMeal.difficulty
          ]);
          
          const createdMeal = mealResult.rows[0];
          
          // Create foods for this meal if provided
          if (meal.foods && Array.isArray(meal.foods)) {
            for (let food of meal.foods) {
              // Sanitize food data
              const sanitizedFood = {
                food_name: food.food_name || '',
                quantity: parseFloat(food.quantity) || 0,
                unit: food.unit || 'g',
                calories_per_serving: sanitizeNumericField(food.calories_per_serving, 'Food Calories'),
                protein_per_serving: sanitizeNumericField(food.protein_per_serving, 'Food Protein'),
                carbs_per_serving: sanitizeNumericField(food.carbs_per_serving, 'Food Carbs'),
                fats_per_serving: sanitizeNumericField(food.fats_per_serving, 'Food Fats'),
                fiber_per_serving: sanitizeNumericField(food.fiber_per_serving, 'Food Fiber'),
                notes: food.notes || ''
              };

              await query(`
                INSERT INTO meal_plan_template_foods (
                  meal_id, food_name, quantity, unit, calories_per_serving,
                  protein_per_serving, carbs_per_serving, fats_per_serving,
                  fiber_per_serving, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              `, [
                createdMeal.id, sanitizedFood.food_name, sanitizedFood.quantity, sanitizedFood.unit,
                sanitizedFood.calories_per_serving, sanitizedFood.protein_per_serving,
                sanitizedFood.carbs_per_serving, sanitizedFood.fats_per_serving,
                sanitizedFood.fiber_per_serving, sanitizedFood.notes
              ]);
            }
          }
        }
      }
      
      await query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Meal plan template created successfully',
        template_id: template.id
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Create meal plan template error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('must be a valid number')) {
      res.status(400).json({ error: error.message });
    } else if (error.code === '22P02') {
      res.status(400).json({ error: 'Invalid data format. Please check all numeric fields.' });
    } else {
      res.status(500).json({ error: 'Failed to create meal plan template. Please try again.' });
    }
  }
};

// Update a meal plan template
export const updateMealPlanTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const nutritionistId = req.userId;
    const updateData = req.body;
    
    // Verify ownership
    const ownershipResult = await query(`
      SELECT id FROM meal_plan_templates 
      WHERE id = $1 AND nutritionist_id = $2
    `, [templateId, nutritionistId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this template' });
    }
    
    // Update template
    const result = await query(`
      UPDATE meal_plan_templates 
      SET 
        template_name = COALESCE($1, template_name),
        template_type = COALESCE($2, template_type),
        target_calories = COALESCE($3, target_calories),
        target_protein = COALESCE($4, target_protein),
        target_carbs = COALESCE($5, target_carbs),
        target_fats = COALESCE($6, target_fats),
        target_fiber = COALESCE($7, target_fiber),
        target_sodium = COALESCE($8, target_sodium),
        target_sugar = COALESCE($9, target_sugar),
        meal_count = COALESCE($10, meal_count),
        duration_weeks = COALESCE($11, duration_weeks),
        difficulty_level = COALESCE($12, difficulty_level),
        dietary_restrictions = COALESCE($13, dietary_restrictions),
        fitness_goal = COALESCE($14, fitness_goal),
        age_group = COALESCE($15, age_group),
        activity_level = COALESCE($16, activity_level),
        description = COALESCE($17, description),
        instructions = COALESCE($18, instructions),
        tips_and_notes = COALESCE($19, tips_and_notes),
        is_public = COALESCE($20, is_public),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
      RETURNING *
    `, [
      updateData.template_name, updateData.template_type, updateData.target_calories,
      updateData.target_protein, updateData.target_carbs, updateData.target_fats,
      updateData.target_fiber, updateData.target_sodium, updateData.target_sugar,
      updateData.meal_count, updateData.duration_weeks, updateData.difficulty_level,
      updateData.dietary_restrictions, updateData.fitness_goal, updateData.age_group,
      updateData.activity_level, updateData.description, updateData.instructions,
      updateData.tips_and_notes, updateData.is_public, templateId
    ]);
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      template: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update meal plan template error:', error);
    res.status(500).json({ error: 'Failed to update meal plan template' });
  }
};

// Delete a meal plan template (soft delete)
export const deleteMealPlanTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const nutritionistId = req.userId;
    
    // Verify ownership
    const ownershipResult = await query(`
      SELECT id FROM meal_plan_templates 
      WHERE id = $1 AND nutritionist_id = $2
    `, [templateId, nutritionistId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this template' });
    }
    
    // Soft delete
    await query(`
      UPDATE meal_plan_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [templateId]);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete meal plan template error:', error);
    res.status(500).json({ error: 'Failed to delete meal plan template' });
  }
};

// Get public templates from other nutritionists
export const getPublicTemplates = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        mpt.*,
        u.first_name, u.last_name,
        COUNT(mptm.id) as total_meals
      FROM meal_plan_templates mpt
      JOIN users u ON mpt.nutritionist_id = u.id
      LEFT JOIN meal_plan_template_meals mptm ON mpt.id = mptm.template_id
      WHERE mpt.is_public = true AND mpt.is_active = true
      GROUP BY mpt.id, u.first_name, u.last_name
      ORDER BY mpt.created_at DESC
      LIMIT 20
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get public templates error:', error);
    res.status(500).json({ error: 'Failed to get public templates' });
  }
};
