import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import { WalkInSalesForm, WalkInSalesPreview, WalkInSalesReceipt } from './WalkInSales';
import ManualCheckInForm from './ManualCheckIn/ManualCheckInForm';

interface FrontDeskPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const FrontDeskPortal = ({ user, onLogout }: FrontDeskPortalProps) => {
  const [currentPage, setCurrentPage] = useState('checkin');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'checkin':
        return <ManualCheckInForm />;
      case 'sales':
        return <WalkInSales showToast={showToast} />;
      case 'pos':
        return <POSSummary showToast={showToast} />;
      case 'announcements':
        return <FrontDeskAnnouncements showToast={showToast} />;
      case 'subscription':
        return <FrontDeskSubscription showToast={showToast} />;
      default:
        return <ManualCheckInForm />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <i className="fas fa-dumbbell text-2xl text-cyan-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'checkin', icon: 'fas fa-qrcode', label: 'Manual Check-In', color: 'text-cyan-400' },
            { id: 'sales', icon: 'fas fa-cash-register', label: 'Walk-In Sales', color: 'text-green-400' },
            { id: 'pos', icon: 'fas fa-receipt', label: 'POS Summary', color: 'text-pink-400' },
            { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
            { id: 'subscription', icon: 'fas fa-cog', label: 'Subscription Management', color: 'text-purple-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-cyan-400 hover:bg-opacity-10 transition-all ${
                currentPage === item.id ? 'bg-cyan-400 bg-opacity-20' : ''
              }`}
            >
              <i className={`${item.icon} ${item.color}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        <div className="topbar px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">Front Desk: {user?.name}</div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};



const WalkInSales = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'receipt'>('form');
  const [memberData, setMemberData] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

        const handleFormSubmit = async (data: any) => {
          try {
            // data is the API response from createMember, which includes membership dates
            setMemberData({
              ...data.profile,
              id: data.user.id, // Add the user ID as member ID
              user_id: data.user.id, // Also include user_id for consistency
              email: data.user.email,
              default_password: data.default_password,
              membership_plan: data.membership_plan,
              payment_details: data.payment_details,
              // Add payment method and confirmation to memberData for receipt
              payment_method: data.payment_details.method,
              payment_confirmed: data.payment_details.confirmed
            });
            setTransactionData({
              transaction_id: `TXN-${Date.now()}`,
              plan_name: data.membership_plan.name,
              plan_price: data.membership_plan.price,
              amount: data.payment_details.amount,
              payment_method: data.payment_details.method,
              member_name: `${data.profile.first_name} ${data.profile.last_name}`,
              email: data.user.email,
              default_password: data.default_password
            });
            setSelectedPlan(data.membership_plan); // Set the selected plan from API response
            setCurrentStep('receipt');
            showToast('Member created successfully!', 'success');
          } catch (error) {
            console.error('Error creating member:', error);
            showToast('Failed to create member. Please try again.', 'error');
          }
        };

  const handlePreview = async (data: any) => {
    setMemberData(data);
    
    // Get plan details if membership_plan_id is provided
    if (data.membership_plan_id) {
      try {
        const response = await fetch(`http://localhost:3001/api/frontdesk/membership-plans`);
        const plansData = await response.json();
        if (plansData.success && plansData.data) {
          const plan = plansData.data.find((p: any) => p.id === parseInt(data.membership_plan_id));
          setSelectedPlan(plan);
        }
      } catch (error) {
        console.error('Error fetching plan details:', error);
      }
    }
    
    setCurrentStep('preview');
  };

  const handlePreviewConfirm = () => {
    handleFormSubmit(memberData);
  };

  const handlePreviewBack = () => {
    setCurrentStep('form');
    // Don't clear memberData so form data is preserved
  };

  const handleReceiptClose = () => {
    setCurrentStep('form');
    setMemberData(null);
    setTransactionData(null);
  };

  const handleReceiptPrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      {currentStep === 'form' && (
        <WalkInSalesForm 
          onSubmit={handleFormSubmit}
          onPreview={handlePreview}
          initialData={memberData}
        />
      )}
      
      {currentStep === 'preview' && memberData && (
        <WalkInSalesPreview
          memberData={memberData}
          selectedPlan={selectedPlan}
          onConfirm={handlePreviewConfirm}
          onBack={handlePreviewBack}
        />
      )}
      
      {currentStep === 'receipt' && memberData && transactionData && (
        <WalkInSalesReceipt
          memberData={memberData}
          transactionData={transactionData}
          selectedPlan={selectedPlan}
          onPrint={handleReceiptPrint}
          onClose={handleReceiptClose}
        />
      )}
    </div>
  );
};

const POSSummary = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const todaysTransactions = [
    { id: 1, time: '9:15 AM', customer: 'John Smith', type: 'Membership', plan: 'Monthly', amount: 79, payment: 'Card' },
    { id: 2, time: '10:30 AM', customer: 'Walk-in', type: 'Drop-in', plan: 'Day Pass', amount: 25, payment: 'Cash' },
    { id: 3, time: '11:45 AM', customer: 'Sarah Davis', type: 'Membership', plan: 'Quarterly', amount: 199, payment: 'Card' },
    { id: 4, time: '1:20 PM', customer: 'Mike Johnson', type: 'Renewal', plan: 'Yearly', amount: 599, payment: 'Card' },
    { id: 5, time: '2:15 PM', customer: 'Walk-in', type: 'Drop-in', plan: 'Day Pass', amount: 25, payment: 'Cash' },
    { id: 6, time: '3:30 PM', customer: 'Emma Wilson', type: 'Membership', plan: 'Monthly', amount: 79, payment: 'Check' }
  ];

  const totalAmount = todaysTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const cashTotal = todaysTransactions.filter(t => t.payment === 'Cash').reduce((sum, t) => sum + t.amount, 0);
  const cardTotal = todaysTransactions.filter(t => t.payment === 'Card').reduce((sum, t) => sum + t.amount, 0);
  const checkTotal = todaysTransactions.filter(t => t.payment === 'Check').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-cyan-400">${totalAmount}</div>
          <div className="text-sm text-gray-400">Total Sales</div>
        </div>
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400">${cashTotal}</div>
          <div className="text-sm text-gray-400">Cash</div>
        </div>
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-400">${cardTotal}</div>
          <div className="text-sm text-gray-400">Card</div>
        </div>
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-yellow-400">${checkTotal}</div>
          <div className="text-sm text-gray-400">Check</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-cyan-400">Today's Transactions</h3>
          <button
            onClick={() => showToast('Transaction report exported', 'success')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Export Report
          </button>
        </div>
        
        <div className="overflow-x-auto minimal-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {todaysTransactions.map((transaction) => (
                <tr key={transaction.id} className="table-row">
                  <td className="p-3">{transaction.time}</td>
                  <td className="p-3 font-semibold">{transaction.customer}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === 'Membership' 
                        ? 'bg-green-600 text-white' 
                        : transaction.type === 'Renewal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-3">{transaction.plan}</td>
                  <td className="p-3 font-bold text-green-400">${transaction.amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      transaction.payment === 'Cash' 
                        ? 'bg-green-600 text-white' 
                        : transaction.payment === 'Card'
                        ? 'bg-blue-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {transaction.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right">
          <div className="text-lg font-bold">
            Total: <span className="text-green-400">${totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FrontDeskSubscription = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const members = [
    { id: 1, name: 'John Smith', email: 'john@email.com', plan: 'Quarterly', status: 'Active', autoRenew: true },
    { id: 2, name: 'Sarah Davis', email: 'sarah@email.com', plan: 'Monthly', status: 'Active', autoRenew: false },
    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', plan: 'Yearly', status: 'Paused', autoRenew: true }
  ];

  const handleMemberSelect = (member: any) => {
    setSelectedMember(member);
    setShowMemberSearch(false);
  };

  const handleSubscriptionAction = (action: string) => {
    if (selectedMember) {
      showToast(`${selectedMember.name}'s subscription ${action}`, 'success');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
          Subscription Management
        </h2>
        
        {!selectedMember ? (
          <div className="text-center py-8">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-semibold mb-4">Select a Member</h3>
            <button
              onClick={() => setShowMemberSearch(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search Member
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-4">Member Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {selectedMember.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedMember.email}
                </div>
                <div>
                  <strong>Plan:</strong> {selectedMember.plan}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedMember.status === 'Active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {selectedMember.status}
                  </span>
                </div>
                <div>
                  <strong>Auto-Renew:</strong> {selectedMember.autoRenew ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleSubscriptionAction('paused')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <i className="fas fa-pause mr-2"></i>
                Pause Subscription
              </button>
              <button
                onClick={() => handleSubscriptionAction('cancelled')}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel Subscription
              </button>
              <button
                onClick={() => handleSubscriptionAction('renewed')}
                className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <i className="fas fa-refresh mr-2"></i>
                Renew Subscription
              </button>
            </div>
            
            <button
              onClick={() => setSelectedMember(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Select Different Member
            </button>
          </div>
        )}
        
        {showMemberSearch && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Select Member</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className="w-full text-left bg-gray-900 hover:bg-gray-800 p-3 rounded-lg transition-colors"
                  >
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-sm text-gray-400">{member.email} • {member.plan}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMemberSearch(false)}
                className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FrontDeskAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const announcements = [
    {
      id: 1,
      title: 'New Equipment Arrival',
      message: 'We have new cardio machines arriving next week!',
      priority: 'high',
      date: '2024-01-20',
      target: 'all'
    },
    {
      id: 2,
      title: 'Front Desk Meeting',
      message: 'Weekly front desk meeting this Friday at 2 PM',
      priority: 'medium',
      date: '2024-01-18',
      target: 'staff'
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      priority: 'high',
      date: '2024-01-15',
      target: 'all'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Announcements
        </h2>
        <p className="text-gray-300">Stay updated with the latest gym announcements</p>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="glass-card p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                  <span className={`text-sm font-semibold ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{announcement.message}</p>
                <p className="text-sm text-gray-400">Posted: {announcement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
