// ==============================================
// GUEST INFO MODAL COMPONENT
// ==============================================

import React, { useState } from 'react';
import { GuestUser } from '../../types/store';
import { usePublicStore } from '../../contexts/PublicStoreContext';

interface GuestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GuestInfoModal({ isOpen, onClose, onSuccess }: GuestInfoModalProps) {
  const { createGuestCart } = usePublicStore();
  const [formData, setFormData] = useState<GuestUser>({
    guest_name: '',
    guest_email: '',
    guest_phone: ''
  });
  const [errors, setErrors] = useState<Partial<GuestUser>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Allow various phone formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestUser> = {};

    // Validate name
    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Name is required';
    } else if (formData.guest_name.trim().length < 2) {
      newErrors.guest_name = 'Name must be at least 2 characters long';
    }

    // Validate email
    if (!formData.guest_email.trim()) {
      newErrors.guest_email = 'Email is required';
    } else if (!validateEmail(formData.guest_email.trim())) {
      newErrors.guest_email = 'Please enter a valid email address';
    }

    // Validate phone (optional but if provided, must be valid)
    if (formData.guest_phone && !validatePhone(formData.guest_phone)) {
      newErrors.guest_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==============================================
  // EVENT HANDLERS
  // ==============================================

  const handleInputChange = (field: keyof GuestUser, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Create guest cart with the provided information
      await createGuestCart({
        guest_name: formData.guest_name.trim(),
        guest_email: formData.guest_email.trim().toLowerCase(),
        guest_phone: formData.guest_phone?.trim() || undefined
      });

      // Reset form
      setFormData({
        guest_name: '',
        guest_email: '',
        guest_phone: ''
      });
      setErrors({});

      // Close modal and notify success
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create guest account';
      setSubmitError(errorMessage);
      console.error('Error creating guest cart:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: ''
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  // ==============================================
  // RENDER
  // ==============================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Guest Checkout Information
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Message */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">No account required!</p>
                  <p>Provide your information to start shopping. We'll use this for order updates and delivery.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) => handleInputChange('guest_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.guest_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.guest_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.guest_name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="guest_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="guest_email"
                  value={formData.guest_email}
                  onChange={(e) => handleInputChange('guest_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.guest_email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
                {errors.guest_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.guest_email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="guest_phone"
                  value={formData.guest_phone}
                  onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.guest_phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
                {errors.guest_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.guest_phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  We'll use this to contact you about your order
                </p>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Start Shopping'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
