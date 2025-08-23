import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import revenueService from './revenueService.js';
import emailService from './emailService.js';
import whatsappService from './whatsappService.js';

const frontDeskService = {
  // Create new member with all related data
  async createMember(memberData) {
    try {
      // Start transaction
      await query('BEGIN');

      // Generate default password
      const defaultPassword = 'Welcome123!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Get membership plan details first
      const planResult = await query(
        'SELECT * FROM membership_plans WHERE id = $1',
        [memberData.membership_plan_id]
      );

      if (planResult.rows.length === 0) {
        throw new Error('Membership plan not found');
      }

      const membershipPlan = planResult.rows[0];

      // Insert into users table
      const userResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, membership_type, created_at) 
         VALUES ($1, $2, $3, $4, 'member', true, $5, NOW()) RETURNING id`,
        [memberData.email, hashedPassword, memberData.first_name, memberData.last_name, membershipPlan.name]
      );

      const userId = userResult.rows[0].id;

      // Calculate membership dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const membershipStartDate = tomorrow.toISOString().split('T')[0];
      
      // Calculate membership end date based on plan duration
      const membershipEndDate = new Date(tomorrow);
      membershipEndDate.setMonth(membershipEndDate.getMonth() + membershipPlan.duration_months);
      const endDate = membershipEndDate.toISOString().split('T')[0];

      // Insert into member_profiles table with membership dates
      await query(
        `INSERT INTO member_profiles 
         (user_id, current_plan_id, membership_start_date, membership_end_date, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, memberData.membership_plan_id, membershipStartDate, endDate]
      );

      // Record revenue
      await revenueService.recordRevenue({
        user_id: userId,
        membership_plan_id: memberData.membership_plan_id,
        amount: membershipPlan.price,
        payment_method: memberData.payment_method,
        revenue_date: new Date(),
        description: `New member registration - ${membershipPlan.name}`,
        created_at: new Date()
      });

      // Send welcome email (don't fail if email sending fails)
      try {
        await emailService.sendWelcomeEmail(memberData.email, {
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          email: memberData.email,
          default_password: defaultPassword,
          membership_plan: membershipPlan.name,
          membership_price: membershipPlan.price
        });
      } catch (emailError) {
        console.error('Email sending failed, but continuing with member creation:', emailError.message);
      }

      // Send WhatsApp welcome message (don't fail if WhatsApp sending fails)
      try {
        await whatsappService.sendWelcomeMessage(memberData.phone, {
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          email: memberData.email,
          default_password: defaultPassword,
          membership_plan: membershipPlan.name
        });
      } catch (whatsappError) {
        console.error('WhatsApp sending failed, but continuing with member creation:', whatsappError.message);
      }

      await query('COMMIT');

      // Return created member data
      return {
        user: {
          id: userId,
          email: memberData.email,
          role: 'member',
          is_active: 1
        },
        profile: {
          user_id: userId,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          date_of_birth: memberData.date_of_birth,
          gender: memberData.gender,
          address: memberData.address,
          emergency_contact: memberData.emergency_contact,
          membership_start_date: membershipStartDate,
          membership_end_date: endDate
        },
        membership_plan: membershipPlan,
        default_password: defaultPassword,
        payment_details: {
          method: memberData.payment_method,
          amount: membershipPlan.price,
          confirmed: memberData.payment_confirmed
        }
      };

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  },

  // Get all active membership plans
  async getMembershipPlans() {
    const result = await query(
      'SELECT * FROM membership_plans WHERE is_active = true ORDER BY price ASC'
    );
    return result.rows;
  },

  // Get POS summary for today
  async getPOSSummary() {
    const today = new Date().toISOString().split('T')[0];
    
    const revenueResult = await query(
      `SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions,
        payment_method,
        COUNT(*) as method_count
       FROM gym_revenue 
       WHERE DATE(revenue_date) = $1
       GROUP BY payment_method`,
      [today]
    );

    const totalResult = await query(
      'SELECT SUM(amount) as total FROM gym_revenue WHERE DATE(revenue_date) = $1',
      [today]
    );

    return {
      date: today,
      total_revenue: totalResult.rows[0]?.total || 0,
      total_transactions: revenueResult.rows.reduce((sum, row) => sum + parseInt(row.method_count), 0),
      payment_methods: revenueResult.rows
    };
  }
};

export default frontDeskService;
