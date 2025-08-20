# Finova Fitness Online Store API Documentation

## Overview
The Online Store API provides a complete e-commerce solution for Finova Fitness, allowing both members and guests to browse products, manage shopping carts, and place orders. The system includes comprehensive inventory management and order tracking capabilities.

## Base URL
```
http://localhost:3001/api/store
```

## Authentication
- **Public Routes**: No authentication required (browsing, cart management, checkout)
- **Admin Routes**: Requires valid JWT token with admin role

## API Endpoints

### 1. Categories

#### Get All Categories
```http
GET /categories
```
**Description**: Retrieve all active product categories
**Response**: Array of category objects
```json
[
  {
    "id": 1,
    "name": "Supplements",
    "description": "Protein powders, vitamins, pre-workout...",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### Add Category (Admin Only)
```http
POST /categories
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

#### Update Category (Admin Only)
```http
PUT /categories/:id
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": true
}
```

### 2. Products

#### Get All Items
```http
GET /items
```
**Query Parameters**:
- `category_id` (optional): Filter by category
- `search` (optional): Search in name and description

**Response**: Array of product objects with category information

#### Add Item (Admin Only)
```http
POST /items
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "category_id": 1,
  "name": "Whey Protein",
  "description": "High-quality protein powder",
  "price": 89.99,
  "member_discount_percentage": 15.0,
  "stock_quantity": 50,
  "low_stock_threshold": 10,
  "image_url": "https://example.com/image.jpg"
}
```

#### Update Item (Admin Only)
```http
PUT /items/:id
Authorization: Bearer <jwt_token>
```
**Body**: Any combination of updatable fields

#### Update Stock (Admin Only)
```http
PUT /items/:id/stock
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "stock_quantity": 75,
  "notes": "Restocked inventory",
  "transaction_type": "stock_in"
}
```

### 3. Shopping Cart

#### Create or Get Cart
```http
POST /cart
```
**Body** (for users):
```json
{
  "user_id": 123
}
```
**Body** (for guests):
```json
{
  "guest_email": "guest@example.com",
  "guest_name": "John Doe",
  "guest_phone": "+1234567890"
}
```

#### Add Item to Cart
```http
POST /cart/items
```
**Body**:
```json
{
  "cart_id": 456,
  "item_id": 789,
  "quantity": 2
}
```

#### Get Cart Contents
```http
GET /cart/:cart_id
```

#### Update Cart Item Quantity
```http
PUT /cart/:cart_id/items/:item_id
```
**Body**:
```json
{
  "quantity": 3
}
```

### 4. Checkout & Orders

#### Process Checkout
```http
POST /checkout
```
**Body**:
```json
{
  "cart_id": 456,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "payment_method": "online",
  "pickup_notes": "Please call when ready"
}
```

#### Get Order by Order Number
```http
GET /orders/:orderNumber
```

#### Get Orders by Email
```http
GET /orders/email/:email
```

### 5. Admin Order Management

#### Get All Orders (Admin Only)
```http
GET /admin/orders
Authorization: Bearer <jwt_token>
```
**Query Parameters**:
- `status` (optional): Filter by order status
- `payment_status` (optional): Filter by payment status
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

#### Update Order Status (Admin Only)
```http
PUT /admin/orders/:id/status
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "status": "ready_for_pickup",
  "notes": "Order is ready for customer pickup"
}
```

#### Confirm Payment (Admin Only)
```http
PUT /admin/orders/:id/payment
Authorization: Bearer <jwt_token>
```
**Body**:
```json
{
  "payment_status": "confirmed",
  "admin_notes": "Payment received via cash"
}
```

#### Get Inventory Overview (Admin Only)
```http
GET /admin/inventory
Authorization: Bearer <jwt_token>
```

## Data Models

### Product Categories
```json
{
  "id": 1,
  "name": "Supplements",
  "description": "Nutritional supplements and vitamins",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Store Items
```json
{
  "id": 1,
  "category_id": 1,
  "name": "Whey Protein Powder",
  "description": "High-quality whey protein isolate",
  "price": 89.99,
  "member_discount_percentage": 15.0,
  "stock_quantity": 50,
  "low_stock_threshold": 10,
  "image_url": "https://example.com/image.jpg",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Shopping Cart
```json
{
  "id": 1,
  "user_id": 123,
  "guest_email": null,
  "guest_name": null,
  "guest_phone": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Orders
```json
{
  "id": 1,
  "cart_id": 1,
  "order_number": "ORD-1705312800000-ABC123DEF",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "total_amount": 179.98,
  "member_discount_total": 26.99,
  "final_amount": 152.99,
  "payment_method": "online",
  "payment_status": "pending",
  "order_status": "pending",
  "pickup_notes": "Please call when ready",
  "admin_notes": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

## Order Status Flow

1. **pending** - Order created, awaiting processing
2. **processing** - Order is being prepared
3. **ready_for_pickup** - Order is ready for customer pickup
4. **completed** - Order has been picked up
5. **cancelled** - Order has been cancelled

## Payment Status

- **pending** - Payment not yet confirmed
- **confirmed** - Payment has been received
- **failed** - Payment failed or was declined

## Member Discount System

- Members automatically receive discounts based on item-specific percentages
- Discounts are calculated at checkout time
- Non-members pay full price
- Discount amounts are tracked in orders for reporting

## Inventory Management

- Real-time stock tracking
- Automatic stock reduction on order placement
- Low stock threshold alerts
- Inventory transaction history
- Admin stock adjustment capabilities

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

Error responses include a descriptive message:
```json
{
  "error": "Item not found or inactive"
}
```

## Setup Instructions

1. **Run Database Migration**:
   ```bash
   npm run setup-store-schema
   ```

2. **Create Sample Data**:
   ```bash
   npm run create-sample-store-data
   ```

3. **Start the Server**:
   ```bash
   npm run dev
   ```

## Testing the API

### Test Public Endpoints
```bash
# Get categories
curl http://localhost:3001/api/store/categories

# Get items
curl http://localhost:3001/api/store/items

# Create guest cart
curl -X POST http://localhost:3001/api/store/cart \
  -H "Content-Type: application/json" \
  -d '{"guest_email":"test@example.com","guest_name":"Test User"}'
```

### Test Admin Endpoints (requires valid JWT token)
```bash
# Add category
curl -X POST http://localhost:3001/api/store/categories \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category","description":"Test description"}'

# Get inventory overview
curl http://localhost:3001/api/store/admin/inventory \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Security Features

- Input validation and sanitization
- SQL injection prevention
- Role-based access control
- JWT token authentication for admin routes
- CORS protection
- Helmet security headers

## Performance Considerations

- Database indexes on frequently queried fields
- Efficient JOIN queries with proper relationships
- Pagination for large result sets
- Connection pooling for database operations

## Future Enhancements

- Image upload and management
- Advanced search and filtering
- Customer reviews and ratings
- Email notifications
- Payment gateway integration
- Shipping and delivery options
- Loyalty program integration
