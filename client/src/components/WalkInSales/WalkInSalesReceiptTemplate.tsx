import React from 'react';

interface WalkInSalesReceiptTemplateProps {
  memberData: any;
  transactionData: any;
  selectedPlan?: any;
}

const WalkInSalesReceiptTemplate: React.FC<WalkInSalesReceiptTemplateProps> = ({
  memberData,
  transactionData,
  selectedPlan
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="receipt-template" style={{ 
      maxWidth: '80mm', 
      margin: '0 auto', 
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.2'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          margin: '0 0 5px 0',
          textTransform: 'uppercase'
        }}>
          Finova Fitness
        </h1>
        <p style={{ margin: '0 0 3px 0', fontSize: '10px' }}>Member Registration</p>
        <p style={{ margin: '0', fontSize: '9px', color: '#666' }}>
          {formatDate(new Date().toISOString())}
        </p>
        <div style={{ 
          borderTop: '1px dashed #ccc', 
          margin: '10px 0',
          height: '1px'
        }}></div>
      </div>

      {/* Transaction Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Transaction:</span>
          <span>{transactionData?.transaction_id || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Member ID:</span>
          <span>{memberData.id || memberData.user_id || 'N/A'}</span>
        </div>
      </div>

      <div style={{ 
        borderTop: '1px dashed #ccc', 
        margin: '10px 0',
        height: '1px'
      }}></div>

      {/* Member Details */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>MEMBER DETAILS</div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Name:</span> {memberData.first_name} {memberData.last_name}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Email:</span> {memberData.email}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Phone:</span> {memberData.phone}
        </div>
        {memberData.date_of_birth && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>DOB:</span> {memberData.date_of_birth}
          </div>
        )}
        {memberData.gender && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Gender:</span> {memberData.gender}
          </div>
        )}
        {memberData.address && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Address:</span> {memberData.address}
          </div>
        )}
        {memberData.emergency_contact && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Emergency:</span> {memberData.emergency_contact}
          </div>
        )}
      </div>

      <div style={{ 
        borderTop: '1px dashed #ccc', 
        margin: '10px 0',
        height: '1px'
      }}></div>

      {/* Plan Details */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>MEMBERSHIP PLAN</div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Plan:</span> {selectedPlan?.name || memberData.membership_plan?.name || 'N/A'}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Duration:</span> {selectedPlan?.duration_months || memberData.membership_plan?.duration_months || 'N/A'} months
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Price:</span> ${selectedPlan?.price || memberData.membership_plan?.price || transactionData?.plan_price || 0}
        </div>
        {memberData.membership_start_date && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Start Date:</span> {memberData.membership_start_date}
          </div>
        )}
        {memberData.membership_end_date && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>End Date:</span> {memberData.membership_end_date}
          </div>
        )}
      </div>

      <div style={{ 
        borderTop: '1px dashed #ccc', 
        margin: '10px 0',
        height: '1px'
      }}></div>

      {/* Payment Details */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>PAYMENT</div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Method:</span> {memberData.payment_method?.toUpperCase() || 'N/A'}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Status:</span> {memberData.payment_confirmed ? 'CONFIRMED' : 'PENDING'}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <span style={{ fontWeight: 'bold' }}>Amount:</span> ${selectedPlan?.price || memberData.membership_plan?.price || transactionData?.amount || 0}
        </div>
      </div>

      <div style={{ 
        borderTop: '1px dashed #ccc', 
        margin: '10px 0',
        height: '1px'
      }}></div>

      {/* Login Credentials */}
      {memberData.default_password && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>LOGIN CREDENTIALS</div>
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Email:</span> {memberData.email}
          </div>
          <div style={{ marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold' }}>Password:</span> {memberData.default_password}
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '5px' }}>
            Change password after first login
          </div>
        </div>
      )}

      <div style={{ 
        borderTop: '1px dashed #ccc', 
        margin: '10px 0',
        height: '1px'
      }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Thank You!
        </div>
        <div style={{ fontSize: '9px', color: '#666', marginBottom: '3px' }}>
          Welcome to Finova Fitness
        </div>
        <div style={{ fontSize: '9px', color: '#666', marginBottom: '3px' }}>
          For support: support@finovafitness.com
        </div>
        <div style={{ fontSize: '9px', color: '#666' }}>
          {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
};

export default WalkInSalesReceiptTemplate;
