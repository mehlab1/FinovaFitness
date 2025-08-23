import React from 'react';

interface WalkInSalesPreviewProps {
  memberData: any;
  selectedPlan?: any;
  onConfirm: () => void;
  onBack: () => void;
}

const WalkInSalesPreview: React.FC<WalkInSalesPreviewProps> = ({ 
  memberData, 
  selectedPlan,
  onConfirm, 
  onBack 
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Member Details Preview</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-gray-900">{memberData.first_name} {memberData.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{memberData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone</label>
              <p className="text-gray-900">{memberData.phone}</p>
            </div>
            {memberData.date_of_birth && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">{memberData.date_of_birth}</p>
              </div>
            )}
            {memberData.gender && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900 capitalize">{memberData.gender}</p>
              </div>
            )}
          </div>
          {memberData.address && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Address</label>
              <p className="text-gray-900">{memberData.address}</p>
            </div>
          )}
          {memberData.emergency_contact && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
              <p className="text-gray-900">{memberData.emergency_contact}</p>
            </div>
          )}
        </div>

        {/* Membership Plan */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Membership Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Plan Name</label>
              <p className="text-gray-900 font-medium">{selectedPlan?.name || 'Loading...'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Duration</label>
              <p className="text-gray-900">{selectedPlan?.duration || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Price</label>
              <p className="text-gray-900 font-semibold">${selectedPlan?.price || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900">{selectedPlan?.description || 'No description available'}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Payment Method</label>
              <p className="text-gray-900 capitalize">{memberData.payment_method}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Payment Status</label>
              <p className="text-green-600 font-medium">
                {memberData.payment_confirmed ? 'Confirmed' : 'Not Confirmed'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Confirm and Create Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalkInSalesPreview;
