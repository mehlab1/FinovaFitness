import { useState, useEffect } from 'react';
import { getRevenueStats, getRevenueDetails, RevenueStats } from '../services/api/adminApi';
import { useToast } from './Toast';

interface RevenueManagementProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const RevenueManagement = ({ showToast }: RevenueManagementProps) => {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [detailedData, setDetailedData] = useState<any>(null);

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  useEffect(() => {
    if (selectedPeriod && dateRange.startDate && dateRange.endDate) {
      fetchDetailedData();
    }
  }, [selectedPeriod, dateRange]);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      const stats = await getRevenueStats();
      setRevenueStats(stats);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      showToast('Failed to load revenue statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    try {
      const data = await getRevenueDetails(selectedPeriod, dateRange.startDate, dateRange.endDate);
      setDetailedData(data);
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      showToast('Failed to load detailed revenue data', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRevenueSourceIcon = (source: string) => {
    switch (source) {
      case 'membership_fees':
        return 'fas fa-id-card text-blue-400';
      case 'personal_training':
        return 'fas fa-dumbbell text-green-400';
      case 'group_classes':
        return 'fas fa-users text-purple-400';
      case 'equipment_rental':
        return 'fas fa-cogs text-orange-400';
      case 'supplement_sales':
        return 'fas fa-pills text-pink-400';
      default:
        return 'fas fa-dollar-sign text-gray-400';
    }
  };

  const getRevenueSourceLabel = (source: string) => {
    return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Revenue Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          REVENUE MANAGEMENT
        </h1>
        <p className="text-gray-300">Comprehensive financial overview and revenue analytics for your gym.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl border-green-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400">Today's Revenue</h3>
            <i className="fas fa-dollar-sign text-green-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {revenueStats ? formatCurrency(revenueStats.todayRevenue) : '$0.00'}
          </p>
          <p className="text-gray-300">
            {revenueStats ? `${revenueStats.todayTransactions} transactions` : '0 transactions'}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400">Month Revenue</h3>
            <i className="fas fa-calendar-alt text-blue-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {revenueStats ? formatCurrency(revenueStats.monthRevenue) : '$0.00'}
          </p>
          <p className="text-gray-300">
            {revenueStats ? `${revenueStats.monthTransactions} transactions` : '0 transactions'}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border-purple-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-400">Year Revenue</h3>
            <i className="fas fa-calendar text-purple-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {revenueStats ? formatCurrency(revenueStats.yearRevenue) : '$0.00'}
          </p>
          <p className="text-gray-300">
            {revenueStats ? `${revenueStats.yearTransactions} transactions` : '0 transactions'}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border-orange-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400">Avg Daily</h3>
            <i className="fas fa-chart-line text-orange-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {revenueStats ? formatCurrency(revenueStats.monthRevenue / 30) : '$0.00'}
          </p>
          <p className="text-gray-300">30-day average</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-orange-400 mb-4">Revenue by Source</h3>
          <div className="space-y-4">
            {revenueStats && Object.entries(revenueStats.revenueBreakdown).map(([source, amount]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className={`${getRevenueSourceIcon(source)} text-xl`}></i>
                  <span className="text-white font-medium">
                    {getRevenueSourceLabel(source)}
                  </span>
                </div>
                <span className="text-xl font-bold text-green-400">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export Revenue Report
            </button>
            <button className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <i className="fas fa-chart-bar mr-2"></i>
              Generate Analytics
            </button>
            <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <i className="fas fa-cog mr-2"></i>
              Revenue Settings
            </button>
            <button 
              onClick={fetchRevenueStats}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <i className="fas fa-sync mr-2"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Period Selector and Detailed Data */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-orange-400">Detailed Revenue Analysis</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600"
            />
            <span className="text-gray-300">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600"
            />
          </div>
        </div>

        {detailedData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-orange-400">Date</th>
                  <th className="p-3 text-orange-400">Source</th>
                  <th className="p-3 text-orange-400">Amount</th>
                  <th className="p-3 text-orange-400">Payment Method</th>
                  <th className="p-3 text-orange-400">Status</th>
                  <th className="p-3 text-orange-400">Notes</th>
                </tr>
              </thead>
              <tbody>
                {detailedData.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-3 text-white">{transaction.revenue_date}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <i className={`${getRevenueSourceIcon(transaction.revenue_source)}`}></i>
                        <span className="text-white">{getRevenueSourceLabel(transaction.revenue_source)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-green-400 font-bold">{formatCurrency(transaction.amount)}</td>
                    <td className="p-3 text-gray-300">{transaction.payment_method}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.transaction_status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {transaction.transaction_status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{transaction.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-chart-line text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">Select a period to view detailed revenue data</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {revenueStats?.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.revenue_source === 'membership_fees' ? 'bg-blue-600' :
                  transaction.revenue_source === 'personal_training' ? 'bg-green-600' :
                  transaction.revenue_source === 'group_classes' ? 'bg-purple-600' : 'bg-gray-600'
                }`}>
                  <i className={`${getRevenueSourceIcon(transaction.revenue_source)} text-white`}></i>
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.notes}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(transaction.revenue_date).toLocaleDateString()} • {transaction.payment_method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-400">{formatCurrency(transaction.amount)}</p>
                <p className="text-gray-400 text-sm">#{transaction.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
