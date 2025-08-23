import React, { useState, useEffect } from 'react';
import useMembershipPlans from '../../hooks/useMembershipPlans';
import useFrontDeskApi from '../../hooks/useFrontDeskApi';
import { MemberCreationData } from '../../services/frontDeskApi';

interface WalkInSalesFormProps {
  onSubmit: (data: any) => void;
  onPreview: (data: any) => void;
  initialData?: any;
}

const WalkInSalesForm: React.FC<WalkInSalesFormProps> = ({ onSubmit, onPreview, initialData }) => {
  const { plans, loading: plansLoading, error: plansError, getPlanById } = useMembershipPlans();
  const { createMember, loading: apiLoading, error: apiError, clearError } = useFrontDeskApi();
  
  const [formData, setFormData] = useState(initialData || {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    membership_plan_id: '',
    payment_method: '',
    payment_confirmed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Get selected plan details
  const selectedPlan = formData.membership_plan_id ? getPlanById(parseInt(formData.membership_plan_id)) : null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name.trim())) {
      newErrors.first_name = 'First name can only contain letters and spaces';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name.trim())) {
      newErrors.last_name = 'Last name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (minimum 8 digits)';
    }

    // Date of birth validation (optional)
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13 || age > 100) {
        newErrors.date_of_birth = 'Age must be between 13 and 100 years';
      }
    }

    // Gender validation (optional)
    if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
      newErrors.gender = 'Please select a valid gender';
    }

    // Address validation (optional)
    if (formData.address && formData.address.length > 255) {
      newErrors.address = 'Address must not exceed 255 characters';
    }

    // Emergency contact validation (optional)
    if (formData.emergency_contact && formData.emergency_contact.length > 255) {
      newErrors.emergency_contact = 'Emergency contact must not exceed 255 characters';
    }

    // Membership plan validation
    if (!formData.membership_plan_id) {
      newErrors.membership_plan_id = 'Please select a membership plan';
    }

    // Payment method validation
    if (!formData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    } else if (!['cash', 'credit_card', 'debit_card', 'online_payment'].includes(formData.payment_method)) {
      newErrors.payment_method = 'Please select a valid payment method';
    }

    // Payment confirmation validation
    if (!formData.payment_confirmed) {
      newErrors.payment_confirmed = 'Payment confirmation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        clearError();
        // Convert empty strings to null for optional fields
        const memberData: MemberCreationData = {
          ...formData,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          address: formData.address || null,
          emergency_contact: formData.emergency_contact || null,
          membership_plan_id: parseInt(formData.membership_plan_id),
          payment_method: formData.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'online_payment'
        };
        
        const createdMember = await createMember(memberData);
        onSubmit(createdMember);
      } catch (error) {
        // Error is handled by the hook
        console.error('Failed to create member:', error);
      }
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPreview(formData);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Walk-In Sales - New Member Registration
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                errors.first_name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                errors.last_name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Optional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Emergency Contact
          </label>
          <input
            type="text"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
            placeholder="Enter emergency contact name and phone"
          />
        </div>

        {/* Membership Plan */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Membership Plan *
          </label>
          <select
            name="membership_plan_id"
            value={formData.membership_plan_id}
            onChange={handleInputChange}
            disabled={plansLoading}
            className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
              errors.membership_plan_id ? 'border-red-500' : 'border-gray-600'
            } ${plansLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {plansLoading ? 'Loading plans...' : 'Select a membership plan'}
            </option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ${plan.price} ({plan.duration})
              </option>
            ))}
          </select>
          {errors.membership_plan_id && (
            <p className="mt-1 text-sm text-red-400">{errors.membership_plan_id}</p>
          )}
          {plansError && (
            <p className="mt-1 text-sm text-red-400">Error loading plans: {plansError}</p>
          )}
        </div>

        {/* Plan Summary */}
        {selectedPlan && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
            <h3 className="font-bold text-green-400 mb-2">Selected Plan Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Plan Name:</span>
                <span className="text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white">{selectedPlan.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="text-green-400 font-semibold">${selectedPlan.price}</span>
              </div>
              {selectedPlan.description && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <span className="text-gray-300">{selectedPlan.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method *
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors ${
                errors.payment_method ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="online_payment">Online Payment</option>
            </select>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-400">{errors.payment_method}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="payment_confirmed"
              checked={formData.payment_confirmed}
              onChange={handleInputChange}
              className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-600 rounded bg-gray-900"
            />
            <label className="ml-2 block text-sm">
              Payment Confirmed *
            </label>
          </div>
        </div>

        {errors.payment_confirmed && (
          <p className="text-sm text-red-400">{errors.payment_confirmed}</p>
        )}

        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              <strong>Error:</strong> {apiError}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handlePreview}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Preview Details
          </button>
          <button
            type="submit"
            disabled={apiLoading}
            className={`px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors font-semibold ${
              apiLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {apiLoading ? 'Creating Member...' : 'Complete Sale'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalkInSalesForm;
