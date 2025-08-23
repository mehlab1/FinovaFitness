import React, { useRef } from 'react';
import WalkInSalesReceiptTemplate from './WalkInSalesReceiptTemplate';
import { printReceipt } from '../../services/printService';

interface WalkInSalesReceiptProps {
  memberData: any;
  transactionData: any;
  selectedPlan?: any;
  onPrint: () => void;
  onClose: () => void;
}

const WalkInSalesReceipt: React.FC<WalkInSalesReceiptProps> = ({ 
  memberData, 
  transactionData, 
  selectedPlan,
  onPrint, 
  onClose 
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      printReceipt(receiptRef.current);
    }
    onPrint();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Receipt Template */}
      <div ref={receiptRef}>
        <WalkInSalesReceiptTemplate
          memberData={memberData}
          transactionData={transactionData}
          selectedPlan={selectedPlan}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Print Receipt
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalkInSalesReceipt;
