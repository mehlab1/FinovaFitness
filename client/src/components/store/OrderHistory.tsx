// ==============================================
// ORDER HISTORY COMPONENT
// ==============================================

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StoreComponentProps, StoreOrder } from '../../types/store';

interface OrderHistoryProps extends StoreComponentProps {
  onBackToCatalog: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  showToast,
  onBackToCatalog,
}) => {
  const {
    state,
    fetchOrders,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // ==============================================
  // INITIAL DATA LOADING
  // ==============================================

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      await fetchOrders();
    } catch (error) {
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // ORDER ACTIONS
  // ==============================================

  const handleViewOrderDetails = (order: StoreOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400';
      case 'processing':
        return 'text-blue-400';
      case 'ready_for_pickup':
        return 'text-green-400';
      case 'completed':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400';
      case 'confirmed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'refunded':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==============================================
  // RENDER LOADING STATE
  // ==============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading order history...</p>
        </div>
      </div>
    );
  }

  // ==============================================
  // RENDER EMPTY STATE
  // ==============================================

  if (!state.orders || state.orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-box text-3xl text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">No Orders Yet</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          You haven't placed any orders yet. Start shopping to see your order history here!
        </p>
        <button
          onClick={onBackToCatalog}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
        >
          <i className="fas fa-shopping-bag"></i>
          <span>Start Shopping</span>
        </button>
      </div>
    );
  }

  // ==============================================
  // RENDER ORDER HISTORY CONTENT
  // ==============================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Order History</h2>
          <p className="text-gray-300">
            {state.orders?.length || 0} order{(state.orders?.length || 0) !== 1 ? 's' : ''} in your history
          </p>
        </div>
        
        <button
          onClick={onBackToCatalog}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {state.orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={handleViewOrderDetails}
            getOrderStatusColor={getOrderStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && showOrderDetails && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          getOrderStatusColor={getOrderStatusColor}
          getPaymentStatusColor={getPaymentStatusColor}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// ==============================================
// ORDER CARD COMPONENT
// ==============================================

interface OrderCardProps {
  order: StoreOrder;
  onViewDetails: (order: StoreOrder) => void;
  getOrderStatusColor: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatDate,
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-700/50 hover:border-green-400/30 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Order #{order.order_number}
              </h3>
              <p className="text-gray-300 text-sm">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  ${Number(order.final_amount).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-400">Order Status:</span>
              <div className={`font-semibold ${getOrderStatusColor(order.order_status)}`}>
                {order.order_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Payment Status:</span>
              <div className={`font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="mb-4">
            <span className="text-sm text-gray-400">Items:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(order.items || []).slice(0, 3).map((item, index) => (
                <span key={index} className="text-sm text-gray-300">
                  {item.name} (x{item.quantity})
                </span>
              ))}
              {(order.items?.length || 0) > 3 && (
                <span className="text-sm text-gray-400">
                  +{(order.items?.length || 0) - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <button
            onClick={() => onViewDetails(order)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-eye"></i>
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// ORDER DETAILS MODAL COMPONENT
// ==============================================

interface OrderDetailsModalProps {
  order: StoreOrder;
  onClose: () => void;
  getOrderStatusColor: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatDate,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Order #{order.order_number}
            </h2>
            <p className="text-gray-300">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Customer Information</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Order Status</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Order Status:</span>
                  <div className={`font-semibold ${getOrderStatusColor(order.order_status)}`}>
                    {order.order_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-400">Payment Status:</span>
                  <div className={`font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-400">Payment Method:</span>
                  <div className="font-semibold text-white">
                    {order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">Order Summary</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${Number(order.total_amount).toFixed(2)}</span>
              </div>
              {Number(order.member_discount_total) > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Member Discount:</span>
                  <span>-${Number(order.member_discount_total).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-600 pt-2 flex justify-between text-white font-bold">
                <span>Total:</span>
                <span>${Number(order.final_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
          <div className="space-y-4">
            {(order.items || []).map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <i className="fas fa-box text-gray-400"></i>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.description}</p>
                  <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${Number(item.subtotal).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${(Number(item.price_at_time) - Number(item.member_discount_applied)).toFixed(2)} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Notes */}
        {order.pickup_notes && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Pickup Notes</h3>
            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
              {order.pickup_notes}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
