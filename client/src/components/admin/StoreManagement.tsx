import React, { useState, useEffect } from 'react';
import { storeApi, StoreAnalytics, InventoryOverview, StoreItem, StoreCategory, StoreOrder, StorePromotion } from '../../services/api/storeApi';
import { useToast } from '../Toast';

interface StoreManagementProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({ showToast }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [inventory, setInventory] = useState<InventoryOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, inventoryData] = await Promise.all([
        storeApi.generateSalesReport({ period: 'monthly' }),
        storeApi.getInventoryOverview()
      ]);
      setAnalytics(analyticsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('No authentication token')) {
        showToast('Please log in as an admin user to access store management features', 'error');
      } else {
        showToast(`Failed to load store dashboard data: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', color: 'text-blue-400' },
    { id: 'products', label: 'Products', icon: 'fas fa-box', color: 'text-green-400' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart', color: 'text-purple-400' },
    { id: 'inventory', label: 'Inventory', icon: 'fas fa-warehouse', color: 'text-orange-400' },
    { id: 'promotions', label: 'Promotions', icon: 'fas fa-tag', color: 'text-pink-400' },
    { id: 'categories', label: 'Categories', icon: 'fas fa-folder', color: 'text-yellow-400' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', color: 'text-indigo-400' }
  ];

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <StoreDashboard analytics={analytics} inventory={inventory} loading={loading} />;
      case 'products':
        return <ProductManagement showToast={showToast} />;
      case 'orders':
        return <OrderManagement showToast={showToast} />;
      case 'inventory':
        return <InventoryManagement showToast={showToast} />;
      case 'promotions':
        return <PromotionManagement showToast={showToast} />;
      case 'categories':
        return <CategoryManagement showToast={showToast} />;
      case 'reports':
        return <ReportsManagement showToast={showToast} />;
      default:
        return <StoreDashboard analytics={analytics} inventory={inventory} loading={loading} />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-orange-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          ONLINE STORE MANAGEMENT
        </h1>
        <p className="text-gray-300">Manage your gym's online store, inventory, and sales.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <i className={`${tab.icon} ${tab.color}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTab()}
      </div>
    </div>
  );
};

// ==============================================
// STORE DASHBOARD COMPONENT
// ==============================================

interface StoreDashboardProps {
  analytics: StoreAnalytics | null;
  inventory: InventoryOverview[];
  loading: boolean;
}

const StoreDashboard: React.FC<StoreDashboardProps> = ({ analytics, inventory, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if we have data, if not, show authentication message
  if (!analytics && !inventory.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-orange-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Authentication Required</h3>
          <p className="text-gray-400 mb-6">
            You need to be logged in as an admin user to access the store management features.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-500/20">
            <p className="text-orange-400 text-sm font-medium mb-2">Admin Login Details:</p>
            <p className="text-gray-300 text-sm">Email: admin@finovafitness.com</p>
            <p className="text-gray-300 text-sm">Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  const lowStockItems = inventory.filter(item => item.stock_status === 'low_stock');
  const outOfStockItems = inventory.filter(item => item.stock_status === 'out_of_stock');

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card p-6 rounded-2xl border-orange-400 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400">Total Revenue</h3>
            <i className="fas fa-dollar-sign text-orange-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics ? formatCurrency(analytics.total_revenue) : '$0'}
          </p>
          <p className="text-gray-300 text-sm">This month</p>
        </div>

        <div className="metric-card p-6 rounded-2xl border-green-400 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400">Total Orders</h3>
            <i className="fas fa-shopping-cart text-green-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics ? analytics.total_orders : 0}
          </p>
          <p className="text-gray-300 text-sm">This month</p>
        </div>

        <div className="metric-card p-6 rounded-2xl border-blue-400 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-400">Avg Order Value</h3>
            <i className="fas fa-chart-line text-blue-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics ? formatCurrency(analytics.average_order_value) : '$0'}
          </p>
          <p className="text-gray-300 text-sm">Per order</p>
        </div>

        <div className="metric-card p-6 rounded-2xl border-purple-400 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-400">Low Stock Items</h3>
            <i className="fas fa-exclamation-triangle text-purple-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white">
            {lowStockItems.length}
          </p>
          <p className="text-gray-300 text-sm">Need attention</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
            <i className="fas fa-trophy mr-2"></i>
            Top Selling Products
          </h3>
          <div className="space-y-3">
            {analytics?.top_selling_products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">{product.quantity_sold} sold</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
            <i className="fas fa-warehouse mr-2"></i>
            Inventory Alerts
          </h3>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-orange-400 text-sm">{item.category_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold">{item.stock_quantity}</p>
                  <p className="text-gray-400 text-xs">in stock</p>
                </div>
              </div>
            ))}
            {outOfStockItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-red-400 text-sm">{item.category_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">Out of Stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
          <i className="fas fa-chart-area mr-2"></i>
          Revenue Trend
        </h3>
        <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-chart-line text-4xl text-blue-400 mb-2"></i>
            <p className="text-gray-400">Revenue chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// PLACEHOLDER COMPONENTS (to be implemented)
// ==============================================

const ProductManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [products, setProducts] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        storeApi.getAllItems(),
        storeApi.getAllCategories()
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load products data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await storeApi.deleteItem(productId);
      setProducts(products.filter(p => p.id !== productId));
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Product Management</h2>
          <p className="text-gray-400">Manage your store products, pricing, and inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/25"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Products</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-green-500/50 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm">{product.category_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-green-400 font-semibold">${product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stock:</span>
                  <span className={`font-semibold ${product.stock_quantity <= product.low_stock_threshold ? 'text-red-400' : 'text-green-400'}`}>
                    {product.stock_quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Discount:</span>
                  <span className="text-orange-400 font-semibold">{product.member_discount_percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-box text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">No Products Found</h3>
          <p className="text-gray-400 mb-6">No products match your current filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
            }}
            className="text-green-400 hover:text-green-300 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

const OrderManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await storeApi.getAllOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await storeApi.updateOrderStatus(orderId, status);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, order_status: status } : order
      ));
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    }
  };

  const handlePaymentConfirmation = async (orderId: number) => {
    try {
      await storeApi.confirmPayment(orderId);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, payment_status: 'confirmed' } : order
      ));
      showToast('Payment confirmed successfully', 'success');
    } catch (error) {
      console.error('Error confirming payment:', error);
      showToast('Failed to confirm payment', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.order_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'preparing': return 'bg-orange-500/20 text-orange-400';
      case 'ready': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-green-600/20 text-green-300';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Management</h2>
          <p className="text-gray-400">View and manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Orders</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, customer name or email..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white">#{order.order_number}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      Payment: {order.payment_status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Customer</p>
                      <p className="text-white font-medium">{order.customer_name}</p>
                      <p className="text-gray-300 text-sm">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Order Total</p>
                      <p className="text-green-400 font-bold text-lg">${order.final_amount}</p>
                      <p className="text-gray-300 text-sm">{order.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Order Date</p>
                      <p className="text-white font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-gray-300 text-sm">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {order.pickup_notes && (
                    <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                      <p className="text-gray-400 text-sm mb-1">Pickup Notes:</p>
                      <p className="text-gray-300 text-sm">{order.pickup_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
                    <div className="flex flex-col gap-2">
                      {order.payment_status === 'pending' && (
                        <button
                          onClick={() => handlePaymentConfirmation(order.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                        >
                          <i className="fas fa-check mr-2"></i>
                          Confirm Payment
                        </button>
                      )}
                      
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t border-gray-700/50 pt-4">
                  <p className="text-gray-400 text-sm mb-3">Order Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{item.quantity}x {item.item_name}</span>
                        <span className="text-green-400 font-medium">${item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shopping-cart text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">No Orders Found</h3>
          <p className="text-gray-400 mb-6">No orders match your current filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
            }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

const InventoryManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [inventory, setInventory] = useState<InventoryOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{itemId: number, newStock: number} | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await storeApi.getInventoryOverview();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast('Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (itemId: number, newStock: number) => {
    try {
      await storeApi.updateStock(itemId, newStock);
      setInventory(inventory.map(item => 
        item.id === itemId ? { 
          ...item, 
          stock_quantity: newStock,
          stock_status: newStock === 0 ? 'out_of_stock' : 
                       newStock <= item.low_stock_threshold ? 'low_stock' : 'in_stock'
        } : item
      ));
      setEditingStock(null);
      showToast('Stock updated successfully', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast('Failed to update stock', 'error');
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filterStatus === 'all') return true;
    return item.stock_status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500/20 text-green-400';
      case 'low_stock': return 'bg-yellow-500/20 text-yellow-400';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return 'fas fa-check-circle';
      case 'low_stock': return 'fas fa-exclamation-triangle';
      case 'out_of_stock': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const stockStats = {
    total: inventory.length,
    inStock: inventory.filter(item => item.stock_status === 'in_stock').length,
    lowStock: inventory.filter(item => item.stock_status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.stock_status === 'out_of_stock').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
          <p className="text-gray-400">Track and manage product stock levels</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{stockStats.total}</p>
            </div>
            <i className="fas fa-boxes text-blue-400 text-2xl"></i>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-green-400">{stockStats.inStock}</p>
            </div>
            <i className="fas fa-check-circle text-green-400 text-2xl"></i>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">{stockStats.lowStock}</p>
            </div>
            <i className="fas fa-exclamation-triangle text-yellow-400 text-2xl"></i>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{stockStats.outOfStock}</p>
            </div>
            <i className="fas fa-times-circle text-red-400 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-300">Filter by Status:</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Products', color: 'text-gray-400' },
              { value: 'in_stock', label: 'In Stock', color: 'text-green-400' },
              { value: 'low_stock', label: 'Low Stock', color: 'text-yellow-400' },
              { value: 'out_of_stock', label: 'Out of Stock', color: 'text-red-400' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === filter.value
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                    : `${filter.color} hover:bg-gray-700/50`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-semibold">Product</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Category</th>
                <th className="text-center p-4 text-gray-300 font-semibold">Current Stock</th>
                <th className="text-center p-4 text-gray-300 font-semibold">Threshold</th>
                <th className="text-center p-4 text-gray-300 font-semibold">Status</th>
                <th className="text-center p-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} className="border-t border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{item.category_name}</span>
                  </td>
                  <td className="p-4 text-center">
                    {editingStock?.itemId === item.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={editingStock.newStock}
                          onChange={(e) => setEditingStock({...editingStock, newStock: parseInt(e.target.value) || 0})}
                          className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center"
                          min="0"
                        />
                        <button
                          onClick={() => handleStockUpdate(item.id, editingStock.newStock)}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${item.stock_quantity <= item.low_stock_threshold ? 'text-red-400' : 'text-green-400'}`}>
                          {item.stock_quantity}
                        </span>
                        <button
                          onClick={() => setEditingStock({itemId: item.id, newStock: item.stock_quantity})}
                          className="text-blue-400 hover:text-blue-300 p-1 ml-2"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-gray-300">{item.low_stock_threshold}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${getStatusColor(item.stock_status)}`}>
                      <i className={getStatusIcon(item.stock_status)}></i>
                      {item.stock_status.replace('_', ' ').charAt(0).toUpperCase() + item.stock_status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingStock({itemId: item.id, newStock: item.stock_quantity + 10})}
                        className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-all"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => setEditingStock({itemId: item.id, newStock: Math.max(0, item.stock_quantity - 10)})}
                        className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Remove 10 units"
                      >
                        -10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-warehouse text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">No Items Found</h3>
          <p className="text-gray-400 mb-6">No items match the selected filter</p>
          <button
            onClick={() => setFilterStatus('all')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Show All Items
          </button>
        </div>
      )}
    </div>
  );
};

const PromotionManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [promotions, setPromotions] = useState<StorePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await storeApi.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showToast('Failed to load promotions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromotion = async (promoId: number, isActive: boolean) => {
    try {
      await storeApi.updatePromotion(promoId, { is_active: !isActive });
      setPromotions(promotions.map(promo => 
        promo.id === promoId ? { ...promo, is_active: !isActive } : promo
      ));
      showToast(`Promotion ${!isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating promotion:', error);
      showToast('Failed to update promotion', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Promotion Management</h2>
          <p className="text-gray-400">Create and manage promotional codes and discounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-pink-500/25"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Promotion
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promotion => (
          <div key={promotion.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-pink-500/50 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{promotion.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${promotion.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {promotion.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg px-3 py-2 mb-3">
                    <code className="text-pink-400 font-mono font-bold">{promotion.code}</code>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePromotion(promotion.id, promotion.is_active)}
                  className={`p-2 rounded-lg transition-all ${promotion.is_active ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                >
                  <i className={`fas ${promotion.is_active ? 'fa-pause' : 'fa-play'}`}></i>
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4">{promotion.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Discount:</span>
                  <span className="text-pink-400 font-semibold">
                    {promotion.discount_type === 'percentage' ? `${promotion.discount_value}%` : `$${promotion.discount_value}`}
                  </span>
                </div>
                
                {promotion.min_order_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Min Order:</span>
                    <span className="text-green-400 font-semibold">${promotion.min_order_amount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Usage:</span>
                  <span className="text-blue-400 font-semibold">
                    {promotion.used_count} / {promotion.usage_limit || '∞'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Valid Until:</span>
                  <span className="text-white font-medium">
                    {new Date(promotion.valid_until).toLocaleDateString()}
                  </span>
                </div>

                {promotion.is_member_only && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                    <span className="text-orange-400 text-xs font-medium">
                      <i className="fas fa-star mr-1"></i>
                      Members Only
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-tag text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">No Promotions Found</h3>
          <p className="text-gray-400 mb-6">Create your first promotional code to boost sales</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Promotion
          </button>
        </div>
      )}
    </div>
  );
};

const CategoryManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await storeApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (categoryData: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        const updated = await storeApi.updateCategory(editingCategory.id, categoryData);
        setCategories(categories.map(cat => cat.id === editingCategory.id ? updated : cat));
        showToast('Category updated successfully', 'success');
      } else {
        const newCategory = await storeApi.addCategory(categoryData);
        setCategories([...categories, newCategory]);
        showToast('Category created successfully', 'success');
      }
      setEditingCategory(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Category Management</h2>
          <p className="text-gray-400">Organize your products into categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/25"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>

              {category.description && (
                <p className="text-gray-300 text-sm mb-4">{category.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-gray-300">{new Date(category.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-gray-300">{new Date(category.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-folder text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">No Categories Found</h3>
          <p className="text-gray-400 mb-6">Create your first category to organize products</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Category
          </button>
        </div>
      )}

      {/* Category Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveCategory({
                name: formData.get('name') as string,
                description: formData.get('description') as string || undefined
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingCategory?.name || ''}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingCategory?.description || ''}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportsManagement: React.FC<{ showToast: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [salesReport, setSalesReport] = useState<StoreAnalytics | null>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('monthly');

  useEffect(() => {
    fetchReports();
  }, [reportPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [salesData, inventoryData] = await Promise.all([
        storeApi.generateSalesReport({ period: reportPeriod as 'monthly' | 'daily' | 'weekly' }),
        storeApi.generateInventoryReport()
      ]);
      setSalesReport(salesData);
      setInventoryReport(inventoryData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reports & Analytics</h2>
          <p className="text-gray-400">Generate and view detailed business insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300"
          >
            <i className="fas fa-print mr-2"></i>
            Print Report
          </button>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-indigo-400">Total Revenue</h3>
            <i className="fas fa-dollar-sign text-indigo-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {salesReport ? formatCurrency(salesReport.total_revenue) : '$0'}
          </p>
          <p className="text-gray-400 text-sm capitalize">{reportPeriod} total</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400">Total Orders</h3>
            <i className="fas fa-shopping-cart text-green-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {salesReport ? salesReport.total_orders : 0}
          </p>
          <p className="text-gray-400 text-sm capitalize">{reportPeriod} orders</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-400">Avg Order Value</h3>
            <i className="fas fa-chart-line text-orange-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {salesReport ? formatCurrency(salesReport.average_order_value) : '$0'}
          </p>
          <p className="text-gray-400 text-sm">Per order</p>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-trophy text-yellow-400 mr-2"></i>
          Top Selling Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-3 text-gray-300">Rank</th>
                <th className="text-left p-3 text-gray-300">Product</th>
                <th className="text-center p-3 text-gray-300">Quantity Sold</th>
                <th className="text-right p-3 text-gray-300">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesReport?.top_selling_products.slice(0, 10).map((product, index) => (
                <tr key={product.id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-white font-medium">{product.name}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-blue-400 font-bold">{product.quantity_sold}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-green-400 font-bold">{formatCurrency(product.revenue)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-warehouse text-orange-400 mr-2"></i>
          Inventory Summary
        </h3>
        
        {inventoryReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">{inventoryReport.summary.total_items}</p>
              <p className="text-gray-400 text-sm">Total Products</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">{inventoryReport.summary.in_stock}</p>
              <p className="text-gray-400 text-sm">In Stock</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-400">{inventoryReport.summary.low_stock}</p>
              <p className="text-gray-400 text-sm">Low Stock</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{inventoryReport.summary.out_of_stock}</p>
              <p className="text-gray-400 text-sm">Out of Stock</p>
            </div>
          </div>
        )}

        {/* Low Stock Items */}
        {salesReport?.low_stock_items && salesReport.low_stock_items.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-red-400 mb-4">Items Needing Attention</h4>
            <div className="space-y-2">
              {salesReport.low_stock_items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{item.current_stock} units</p>
                    <p className="text-gray-400 text-xs">Threshold: {item.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart Placeholder */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-chart-area text-purple-400 mr-2"></i>
          Revenue Trend
        </h3>
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-chart-line text-4xl text-purple-400 mb-4"></i>
            <p className="text-gray-400 mb-2">Revenue Chart</p>
            <p className="text-gray-500 text-sm">Chart visualization will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;
