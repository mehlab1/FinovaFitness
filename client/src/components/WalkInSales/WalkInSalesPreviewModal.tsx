import React from 'react';
import WalkInSalesPreview from './WalkInSalesPreview';

interface WalkInSalesPreviewModalProps {
  isOpen: boolean;
  memberData: any;
  selectedPlan?: any;
  onConfirm: () => void;
  onClose: () => void;
  onBack: () => void;
}

const WalkInSalesPreviewModal: React.FC<WalkInSalesPreviewModalProps> = ({
  isOpen,
  memberData,
  selectedPlan,
  onConfirm,
  onClose,
  onBack
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Member Details Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <WalkInSalesPreview
              memberData={memberData}
              selectedPlan={selectedPlan}
              onConfirm={onConfirm}
              onBack={onBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInSalesPreviewModal;
