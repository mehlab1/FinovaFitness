import { body } from 'express-validator';

const frontDeskValidation = {
  validateMemberCreation: [
    // Required fields
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),

    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[\+]?[1-9][\d]{7,15}$/)
      .withMessage('Please provide a valid phone number (minimum 8 digits)'),

    body('membership_plan_id')
      .notEmpty()
      .withMessage('Membership plan is required')
      .isInt({ min: 1 })
      .withMessage('Please select a valid membership plan'),

    body('payment_method')
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['cash', 'credit_card', 'debit_card', 'online_payment'])
      .withMessage('Please select a valid payment method'),

    body('payment_confirmed')
      .isBoolean()
      .withMessage('Payment confirmation must be a boolean value')
      .custom((value) => {
        if (!value) {
          throw new Error('Payment must be confirmed before creating member');
        }
        return true;
      }),

    // Optional fields
    body('date_of_birth')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 13 || age > 100) {
            throw new Error('Age must be between 13 and 100 years');
          }
        }
        return true;
      }),

    body('gender')
      .optional({ checkFalsy: true })
      .isIn(['male', 'female', 'other'])
      .withMessage('Please select a valid gender'),

    body('address')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage('Address must not exceed 255 characters'),

    body('emergency_contact')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage('Emergency contact must not exceed 255 characters')
  ]
};

export default frontDeskValidation;
