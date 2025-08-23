import axios from 'axios';

const whatsappService = {
  // Send welcome message to new member
  async sendWelcomeMessage(phoneNumber, memberData) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const message = this.createWelcomeMessage(memberData);
      
      const response = await axios.post(
        `${process.env.WHATSAPP_API_URL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp welcome message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp welcome message:', error);
      // Don't throw error to avoid failing the main transaction
      return null;
    }
  },

  // Format phone number for WhatsApp API
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US/Canada +1)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Add + prefix
    return '+' + cleaned;
  },

  // Create welcome message content
  createWelcomeMessage(memberData) {
    return `🎉 Welcome to Finova Fitness, ${memberData.first_name}!

Your account has been successfully created!

📧 Email: ${memberData.email}
🔑 Default Password: ${memberData.default_password}
📋 Membership Plan: ${memberData.membership_plan}

⚠️ Important: Please change your password after your first login for security.

🏋️‍♂️ Get started by:
• Visiting our member portal
• Scheduling your first training session
• Exploring our facilities

Need help? Contact our support team!

Welcome to the Finova Fitness family! 💪`;
  },

  // Send appointment reminder
  async sendAppointmentReminder(phoneNumber, appointmentData) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const message = this.createAppointmentReminder(appointmentData);
      
      const response = await axios.post(
        `${process.env.WHATSAPP_API_URL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp appointment reminder sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp appointment reminder:', error);
      return null;
    }
  },

  // Create appointment reminder message
  createAppointmentReminder(appointmentData) {
    return `📅 Appointment Reminder

Hi ${appointmentData.member_name}!

This is a friendly reminder about your upcoming appointment:

📋 Service: ${appointmentData.service_name}
🕐 Date & Time: ${appointmentData.appointment_time}
👨‍💼 Trainer: ${appointmentData.trainer_name}

Please arrive 10 minutes before your scheduled time.

Need to reschedule? Contact us at least 24 hours in advance.

See you soon! 💪`;
  },

  // Send membership renewal reminder
  async sendRenewalReminder(phoneNumber, membershipData) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const message = this.createRenewalReminder(membershipData);
      
      const response = await axios.post(
        `${process.env.WHATSAPP_API_URL}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp renewal reminder sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp renewal reminder:', error);
      return null;
    }
  },

  // Create renewal reminder message
  createRenewalReminder(membershipData) {
    return `🔄 Membership Renewal Reminder

Hi ${membershipData.member_name}!

Your membership is expiring soon:

📋 Current Plan: ${membershipData.plan_name}
📅 Expiry Date: ${membershipData.expiry_date}
💰 Renewal Price: $${membershipData.renewal_price}

Don't let your fitness journey pause! Renew now to continue enjoying all our facilities and services.

Contact us to renew or upgrade your membership.

Keep up the great work! 💪`;
  }
};

export default whatsappService;
