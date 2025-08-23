module.exports = {
  // Create welcome message for new members
  createWelcomeMessage: (memberData) => {
    return `🎉 Welcome to Finova Fitness, ${memberData.first_name}!

Your account has been successfully created!

📧 Email: ${memberData.email}
🔑 Default Password: ${memberData.default_password}

⚠️ Important: Please change your password after your first login for security.

🏋️‍♂️ Get started by:
• Visiting our member portal
• Scheduling your first training session
• Exploring our facilities

Need help? Contact our support team!

Welcome to the Finova Fitness family! 💪`;
  },

  // Create appointment reminder message
  createAppointmentReminder: (appointmentData) => {
    return `⏰ Appointment Reminder

Hi ${appointmentData.member_name}!

You have an upcoming appointment:
📅 Date: ${appointmentData.date}
🕐 Time: ${appointmentData.time}
👨‍🏫 Trainer: ${appointmentData.trainer_name}

Please arrive 10 minutes early.

Need to reschedule? Contact us at least 24 hours in advance.

See you soon! 💪`;
  },

  // Create membership renewal reminder
  createRenewalReminder: (membershipData) => {
    return `🔄 Membership Renewal Reminder

Hi ${membershipData.member_name}!

Your membership expires on ${membershipData.expiry_date}.

To continue enjoying our facilities, please renew your membership.

Current Plan: ${membershipData.plan_name}
Price: $${membershipData.price}

Contact us to renew or upgrade your membership!

Thank you for being part of Finova Fitness! 💪`;
  },

  // Create workout reminder
  createWorkoutReminder: (memberData) => {
    return `💪 Workout Reminder

Hi ${memberData.first_name}!

Don't forget your workout today! 

Remember:
• Stay hydrated
• Warm up properly
• Push yourself but listen to your body
• Have fun!

You're doing great! Keep up the amazing work! 🏋️‍♂️`;
  },

  // Create class reminder
  createClassReminder: (classData) => {
    return `🏃‍♀️ Class Reminder

Hi ${classData.member_name}!

Your class is starting soon:
📅 Date: ${classData.date}
🕐 Time: ${classData.time}
🏋️‍♂️ Class: ${classData.class_name}
👨‍🏫 Instructor: ${classData.instructor_name}

Please arrive 5-10 minutes early to set up.

See you there! 💪`;
  }
};
