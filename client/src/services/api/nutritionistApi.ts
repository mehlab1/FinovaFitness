import { DietPlanRequest, MealPlanTemplate, ComprehensiveDietPlan, WeeklyMealPlan, Recipe } from '../../types';
import { apiCall } from './index';

export const nutritionistApi = {
  // Get diet plan requests for the nutritionist
  getDietPlanRequests: async (): Promise<DietPlanRequest[]> => {
    return apiCall('/nutritionists/diet-plan-requests');
  },

  // Update diet plan request status and details
  updateDietPlanRequest: async (
    requestId: number, 
    data: {
      status?: 'pending' | 'approved' | 'rejected' | 'completed';
      nutritionist_notes?: string;
      preparation_time?: string;
      meal_plan?: string;
    }
  ): Promise<DietPlanRequest> => {
    return apiCall(`/nutritionists/diet-plan-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get meal plan templates
  getMealPlanTemplates: async (): Promise<MealPlanTemplate[]> => {
    return apiCall('/meal-plan-templates');
  },

  // Create meal plan template
  createMealPlanTemplate: async (template: Omit<MealPlanTemplate, 'id'>): Promise<MealPlanTemplate> => {
    return apiCall('/meal-plan-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  // Update meal plan template
  updateMealPlanTemplate: async (id: number, template: Partial<MealPlanTemplate>): Promise<MealPlanTemplate> => {
    return apiCall(`/meal-plan-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  },

  // Delete meal plan template
  deleteMealPlanTemplate: async (id: number): Promise<void> => {
    return apiCall(`/meal-plan-templates/${id}`, {
      method: 'DELETE',
    });
  },

  // Comprehensive Diet Plan APIs
  createComprehensiveDietPlan: async (dietPlan: Omit<ComprehensiveDietPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ComprehensiveDietPlan> => {
    return apiCall('/nutritionists/comprehensive-diet-plans', {
      method: 'POST',
      body: JSON.stringify(dietPlan),
    });
  },

  updateComprehensiveDietPlan: async (id: number, dietPlan: Partial<ComprehensiveDietPlan>): Promise<ComprehensiveDietPlan> => {
    return apiCall(`/nutritionists/comprehensive-diet-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dietPlan),
    });
  },

  getComprehensiveDietPlan: async (id: number): Promise<ComprehensiveDietPlan> => {
    return apiCall(`/nutritionists/comprehensive-diet-plans/${id}`);
  },

  getComprehensiveDietPlans: async (): Promise<ComprehensiveDietPlan[]> => {
    return apiCall('/nutritionists/comprehensive-diet-plans');
  },

  saveDietPlanProgress: async (id: number, progress: {
    current_step: number;
    weekly_plans?: WeeklyMealPlan[];
    status?: 'draft' | 'in_progress' | 'completed' | 'reviewed';
    progress_notes?: string[];
  }): Promise<ComprehensiveDietPlan> => {
    return apiCall(`/nutritionists/comprehensive-diet-plans/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(progress),
    });
  },

  // Recipe management
  createRecipe: async (recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
    return apiCall('/nutritionists/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  },

  updateRecipe: async (id: number, recipe: Partial<Recipe>): Promise<Recipe> => {
    return apiCall(`/nutritionists/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    });
  },

  getRecipes: async (): Promise<Recipe[]> => {
    return apiCall('/nutritionists/recipes');
  },

  deleteRecipe: async (id: number): Promise<void> => {
    return apiCall(`/nutritionists/recipes/${id}`, {
      method: 'DELETE',
    });
  },
};
