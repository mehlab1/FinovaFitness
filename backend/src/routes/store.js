import express from 'express';
import storeController from '../controllers/storeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// ==============================================
// PUBLIC ROUTES (No authentication required)
// ==============================================

// Get all categories
router.get('/categories', storeController.getAllCategories);

// Get all items (with optional filtering)
router.get('/items', storeController.getAllItems);

// Get cart contents
router.get('/cart/:cart_id', storeController.getCart);

// ==============================================
// CART & CHECKOUT ROUTES (Public)
// ==============================================

// Create or get cart (for both users and guests)
router.post('/cart', storeController.createOrGetCart);

// Add item to cart
router.post('/cart/items', storeController.addToCart);

// Update cart item quantity
router.put('/cart/:cart_id/items/:item_id', storeController.updateCartItem);

// Process checkout
router.post('/checkout', storeController.checkout);

// Get order by order number
router.get('/orders/:orderNumber', storeController.getOrderByNumber);

// Get orders by email
router.get('/orders/email/:email', storeController.getOrdersByEmail);

// ==============================================
// ADMIN-ONLY ROUTES
// ==============================================

// Category management
router.post('/categories', verifyToken, requireAdmin, storeController.addCategory);
router.put('/categories/:id', verifyToken, requireAdmin, storeController.updateCategory);

// Item management
router.post('/items', verifyToken, requireAdmin, storeController.addItem);
router.put('/items/:id', verifyToken, requireAdmin, storeController.updateItem);
router.put('/items/:id/stock', verifyToken, requireAdmin, storeController.updateStock);

// Order management
router.get('/admin/orders', verifyToken, requireAdmin, storeController.getAllOrders);
router.put('/admin/orders/:id/status', verifyToken, requireAdmin, storeController.updateOrderStatus);
router.put('/admin/orders/:id/payment', verifyToken, requireAdmin, storeController.confirmPayment);

// Inventory management
router.get('/admin/inventory', verifyToken, requireAdmin, storeController.getInventoryOverview);

// ==============================================
// ENHANCED ADMIN ROUTES
// ==============================================

// Product management
router.delete('/admin/items/:id', verifyToken, requireAdmin, storeController.deleteItem);

// Reports
router.get('/admin/reports/sales', verifyToken, requireAdmin, storeController.generateSalesReport);
router.get('/admin/reports/inventory', verifyToken, requireAdmin, storeController.generateInventoryReport);

// Promotions
router.post('/admin/promotions', verifyToken, requireAdmin, storeController.createPromotion);
router.get('/admin/promotions', verifyToken, requireAdmin, storeController.getAllPromotions);
router.put('/admin/promotions/:id', verifyToken, requireAdmin, storeController.updatePromotion);

// Refunds
router.post('/admin/orders/:order_id/refund', verifyToken, requireAdmin, storeController.processRefund);

// Low stock alerts
router.get('/admin/alerts/low-stock', verifyToken, requireAdmin, storeController.getLowStockAlerts);

// ==============================================
// MEMBER ROUTES (Require authentication)
// ==============================================

// Order history
router.get('/member/orders', verifyToken, storeController.getMemberOrderHistory);

// Wishlist
router.get('/member/wishlist', verifyToken, storeController.getWishlist);
router.post('/member/wishlist', verifyToken, storeController.addToWishlist);
router.delete('/member/wishlist/:item_id', verifyToken, storeController.removeFromWishlist);

// Loyalty points
router.get('/member/loyalty-points', verifyToken, storeController.getLoyaltyPointsBalance);
router.post('/member/loyalty-points/apply', verifyToken, storeController.applyLoyaltyPoints);

// ==============================================
// PUBLIC ROUTES (Enhanced)
// ==============================================

// Product reviews
router.get('/items/:item_id/reviews', storeController.getProductReviews);
router.post('/items/:item_id/reviews', storeController.addReview);

// Promotional codes
router.post('/validate-promo-code', storeController.validatePromotionalCode);

// Enhanced checkout
router.post('/checkout-enhanced', storeController.enhancedCheckout);

export default router;
