import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';

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
        return <ManualCheckIn showToast={showToast} />;
      case 'sales':
        return <WalkInSales showToast={showToast} />;
      case 'pos':
        return <POSSummary showToast={showToast} />;
      case 'subscription':
        return <FrontDeskSubscription showToast={showToast} />;
      default:
        return <ManualCheckIn showToast={showToast} />;
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

const ManualCheckIn = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const members = [
    { id: 1, name: 'John Smith', email: 'john@email.com', membershipId: 'M001', plan: 'Quarterly', status: 'Active' },
    { id: 2, name: 'Sarah Davis', email: 'sarah@email.com', membershipId: 'M002', plan: 'Monthly', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', membershipId: 'M003', plan: 'Yearly', status: 'Active' },
    { id: 4, name: 'Emma Wilson', email: 'emma@email.com', membershipId: 'M004', plan: 'Monthly', status: 'Active' },
    { id: 5, name: 'David Brown', email: 'david@email.com', membershipId: 'M005', plan: 'Quarterly', status: 'Active' }
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (member: any) => {
    setSelectedMember(member);
    showToast(`${member.name} checked in - loyalty points added!`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Member Check-In
        </h2>
        <div className="glass-card p-6 rounded-2xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Search Member</label>
            <input
              type="text"
              placeholder="Search by name, email, or member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
          
          {searchTerm && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-cyan-400">Search Results</h3>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{member.name}</h4>
                      <p className="text-gray-300">{member.email} • ID: {member.membershipId}</p>
                      <p className="text-sm text-gray-400">Plan: {member.plan} • Status: {member.status}</p>
                    </div>
                    <button
                      onClick={() => handleCheckIn(member)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <i className="fas fa-qrcode mr-2"></i>
                      Check In
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No members found matching "{searchTerm}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Recent Check-ins</h3>
        <div className="space-y-2">
          {[
            { name: 'John Smith', time: '2 minutes ago', points: '+10 points' },
            { name: 'Sarah Davis', time: '15 minutes ago', points: '+10 points' },
            { name: 'Mike Johnson', time: '32 minutes ago', points: '+10 points' },
            { name: 'Emma Wilson', time: '45 minutes ago', points: '+10 points' }
          ].map((checkin, index) => (
            <div key={index} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{checkin.name}</span>
                <span className="text-gray-400 ml-2">{checkin.time}</span>
              </div>
              <span className="text-green-400 font-semibold">{checkin.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WalkInSales = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [saleData, setSaleData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: '',
    paymentMethod: 'cash'
  });

  const plans = [
    { id: 'drop-in', name: 'Drop-In', price: 25 },
    { id: 'monthly', name: 'Monthly', price: 79 },
    { id: 'quarterly', name: 'Quarterly', price: 199 },
    { id: 'yearly', name: 'Yearly', price: 599 }
  ];

  const handleSale = () => {
    if (saleData.name && saleData.email && saleData.phone && saleData.plan) {
      const selectedPlan = plans.find(p => p.id === saleData.plan);
      showToast(`Membership sold to ${saleData.name} for $${selectedPlan?.price}`, 'success');
      setSaleData({ name: '', email: '', phone: '', plan: '', paymentMethod: 'cash' });
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
          Walk-In Membership Sales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                value={saleData.name}
                onChange={(e) => setSaleData({ ...saleData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={saleData.email}
                onChange={(e) => setSaleData({ ...saleData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={saleData.phone}
                onChange={(e) => setSaleData({ ...saleData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Membership Plan *</label>
              <select
                value={saleData.plan}
                onChange={(e) => setSaleData({ ...saleData, plan: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="">Select a plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                value={saleData.paymentMethod}
                onChange={(e) => setSaleData({ ...saleData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="check">Check</option>
              </select>
            </div>
            
            {saleData.plan && (
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-green-400 mb-2">Sale Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>{plans.find(p => p.id === saleData.plan)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="text-green-400">${plans.find(p => p.id === saleData.plan)?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span>{saleData.paymentMethod}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSale}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-bold hover-glow transition-all duration-300"
          >
            Complete Sale
          </button>
        </div>
      </div>
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
        
        <div className="overflow-x-auto">
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
