// ==============================================
// STORE INTEGRATION TEST UTILITY
// ==============================================

import { publicStoreApi } from '../services/api/publicStoreApi';
import { StoreDataValidator } from './storeDataValidator';
import {
  StoreItem,
  StoreCategory,
  CartItem,
  StoreOrder,
  CheckoutData,
  PromotionalCode,
  ProductReview,
  GuestUser,
  StoreCart
} from '../types/store';

// ==============================================
// TEST RESULTS INTERFACE
// ==============================================

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  details?: any;
  duration: number;
}

interface IntegrationTestResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  summary: string;
  timestamp: string;
}

// ==============================================
// INTEGRATION TEST CLASS
// ==============================================

export class StoreIntegrationTest {
  private results: TestResult[] = [];
  private testData: {
    categories?: StoreCategory[];
    products?: StoreItem[];
    cart?: StoreCart;
    cartItems?: CartItem[];
    order?: StoreOrder;
  } = {};

  // ==============================================
  // MAIN TEST RUNNER
  // ==============================================

  async runAllTests(): Promise<IntegrationTestResults> {
    console.log('🚀 Starting Store Integration Tests...');
    
    const startTime = Date.now();
    this.results = [];

    try {
      // Test 1: API Connectivity
      await this.testApiConnectivity();
      
      // Test 2: Categories API
      await this.testCategoriesApi();
      
      // Test 3: Products API
      await this.testProductsApi();
      
      // Test 4: Guest Cart Creation
      await this.testGuestCartCreation();
      
      // Test 5: Add to Cart
      await this.testAddToCart();
      
      // Test 6: Cart Operations
      await this.testCartOperations();
      
      // Test 7: Checkout Process
      await this.testCheckoutProcess();
      
      // Test 8: Order Retrieval
      await this.testOrderRetrieval();
      
      // Test 9: Promotional Codes
      await this.testPromotionalCodes();
      
      // Test 10: Product Reviews
      await this.testProductReviews();
      
      // Test 11: Data Type Consistency
      await this.testDataTypeConsistency();
      
      // Test 12: Error Handling
      await this.testErrorHandling();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.addResult('Test Suite', false, error instanceof Error ? error.message : 'Unknown error');
    }

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    return this.generateResults(totalDuration);
  }

  // ==============================================
  // INDIVIDUAL TESTS
  // ==============================================

  private async testApiConnectivity(): Promise<void> {
    const testName = 'API Connectivity Test';
    const startTime = Date.now();

    try {
      // Test basic connectivity by making a simple request
      const categories = await publicStoreApi.getAllCategories();
      
      if (!Array.isArray(categories)) {
        throw new Error('Categories response is not an array');
      }

      this.addResult(testName, true, undefined, { categoriesCount: categories.length });
      console.log('✅ API Connectivity Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ API Connectivity Test failed:', error);
    }
  }

  private async testCategoriesApi(): Promise<void> {
    const testName = 'Categories API Test';
    const startTime = Date.now();

    try {
      const categories = await publicStoreApi.getAllCategories();
      
      // Validate data structure
      const validatedCategories = StoreDataValidator.validateCategories(categories);
      
      // Store for later tests
      this.testData.categories = validatedCategories;

      this.addResult(testName, true, undefined, { 
        categoriesCount: validatedCategories.length,
        sampleCategory: validatedCategories[0] 
      });
      console.log('✅ Categories API Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Categories API Test failed:', error);
    }
  }

  private async testProductsApi(): Promise<void> {
    const testName = 'Products API Test';
    const startTime = Date.now();

    try {
      const products = await publicStoreApi.getAllItems();
      
      // Validate data structure
      const validatedProducts = StoreDataValidator.validateProducts(products);
      
      // Store for later tests
      this.testData.products = validatedProducts;

      this.addResult(testName, true, undefined, { 
        productsCount: validatedProducts.length,
        sampleProduct: validatedProducts[0],
        categoriesWithProducts: this.getCategoriesWithProducts(validatedProducts)
      });
      console.log('✅ Products API Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Products API Test failed:', error);
    }
  }

  private async testGuestCartCreation(): Promise<void> {
    const testName = 'Guest Cart Creation Test';
    const startTime = Date.now();

    try {
      const guestData: GuestUser = {
        guest_name: 'Test User',
        guest_email: 'test@example.com',
        guest_phone: '+1234567890'
      };

      // Validate guest data
      StoreDataValidator.validateGuestUser(guestData);

      const cart = await publicStoreApi.createGuestCart(guestData);
      
      // Validate cart structure
      const validatedCart = StoreDataValidator.validateCart(cart);
      
      // Store for later tests
      this.testData.cart = validatedCart;

      this.addResult(testName, true, undefined, { 
        cartId: validatedCart.id,
        guestEmail: validatedCart.guest_email 
      });
      console.log('✅ Guest Cart Creation Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Guest Cart Creation Test failed:', error);
    }
  }

  private async testAddToCart(): Promise<void> {
    const testName = 'Add to Cart Test';
    const startTime = Date.now();

    try {
      if (!this.testData.cart || !this.testData.products || this.testData.products.length === 0) {
        throw new Error('Prerequisites not met: cart or products not available');
      }

      const product = this.testData.products[0];
      const cartItems = await publicStoreApi.addToCart(this.testData.cart.id, product.id, 2);
      
      // Validate cart items
      const validatedCartItems = StoreDataValidator.validateCartItems(cartItems);
      
      // Store for later tests
      this.testData.cartItems = validatedCartItems;

      this.addResult(testName, true, undefined, { 
        addedProduct: product.name,
        quantity: 2,
        cartItemsCount: validatedCartItems.length,
        totalValue: this.calculateCartTotal(validatedCartItems)
      });
      console.log('✅ Add to Cart Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Add to Cart Test failed:', error);
    }
  }

  private async testCartOperations(): Promise<void> {
    const testName = 'Cart Operations Test';
    const startTime = Date.now();

    try {
      if (!this.testData.cart || !this.testData.cartItems || this.testData.cartItems.length === 0) {
        throw new Error('Prerequisites not met: cart or cart items not available');
      }

      const cartItem = this.testData.cartItems[0];

      // Test update cart item
      await publicStoreApi.updateCartItem(this.testData.cart.id, cartItem.item_id, 3);
      
      // Test get cart
      const updatedCartItems = await publicStoreApi.getCart(this.testData.cart.id);
      const validatedUpdatedItems = StoreDataValidator.validateCartItems(updatedCartItems);
      
      // Verify the update worked
      const updatedItem = validatedUpdatedItems.find(item => item.item_id === cartItem.item_id);
      if (!updatedItem || updatedItem.quantity !== 3) {
        throw new Error('Cart item update failed');
      }

      this.addResult(testName, true, undefined, { 
        updatedItemId: cartItem.item_id,
        newQuantity: updatedItem.quantity,
        cartItemsCount: validatedUpdatedItems.length
      });
      console.log('✅ Cart Operations Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Cart Operations Test failed:', error);
    }
  }

  private async testCheckoutProcess(): Promise<void> {
    const testName = 'Checkout Process Test';
    const startTime = Date.now();

    try {
      if (!this.testData.cart) {
        throw new Error('Prerequisites not met: cart not available');
      }

      const checkoutData: CheckoutData = {
        cart_id: this.testData.cart.id,
        customer_name: 'Test Customer',
        customer_email: 'customer@example.com',
        customer_phone: '+1234567890',
        payment_method: 'online',
        pickup_notes: 'Test pickup notes'
      };

      // Validate checkout data
      StoreDataValidator.validateCheckoutData(checkoutData);

      const checkoutResponse = await publicStoreApi.processCheckout(checkoutData);
      
      // Validate response
      if (!checkoutResponse.order || !checkoutResponse.order.order_number) {
        throw new Error('Invalid checkout response');
      }

      // Store order for later tests
      const order = await publicStoreApi.getOrderByNumber(checkoutResponse.order.order_number);
      const validatedOrder = StoreDataValidator.validateOrder(order);
      this.testData.order = validatedOrder;

      this.addResult(testName, true, undefined, { 
        orderNumber: validatedOrder.order_number,
        finalAmount: validatedOrder.final_amount,
        orderStatus: validatedOrder.order_status,
        itemsCount: validatedOrder.items.length
      });
      console.log('✅ Checkout Process Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Checkout Process Test failed:', error);
    }
  }

  private async testOrderRetrieval(): Promise<void> {
    const testName = 'Order Retrieval Test';
    const startTime = Date.now();

    try {
      if (!this.testData.order) {
        throw new Error('Prerequisites not met: order not available');
      }

      // Test order retrieval by number
      const retrievedOrder = await publicStoreApi.getOrderByNumber(this.testData.order.order_number);
      const validatedRetrievedOrder = StoreDataValidator.validateOrder(retrievedOrder);

      // Test orders retrieval by email
      const ordersByEmail = await publicStoreApi.getOrdersByEmail(this.testData.order.customer_email);
      const validatedOrdersByEmail = StoreDataValidator.validateOrders(ordersByEmail);

      // Verify consistency
      if (validatedRetrievedOrder.id !== this.testData.order.id) {
        throw new Error('Order retrieval inconsistency');
      }

      if (!validatedOrdersByEmail.find(order => order.id === this.testData.order!.id)) {
        throw new Error('Order not found in email search results');
      }

      this.addResult(testName, true, undefined, { 
        orderNumber: validatedRetrievedOrder.order_number,
        ordersByEmailCount: validatedOrdersByEmail.length,
        customerEmail: validatedRetrievedOrder.customer_email
      });
      console.log('✅ Order Retrieval Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Order Retrieval Test failed:', error);
    }
  }

  private async testPromotionalCodes(): Promise<void> {
    const testName = 'Promotional Codes Test';
    const startTime = Date.now();

    try {
      // Test with a sample promotional code (assuming one exists)
      const promoCode = await publicStoreApi.validatePromotionalCode('TEST10');
      
      if (promoCode) {
        // Validate promotional code structure
        const validatedPromoCode = StoreDataValidator.validatePromotionalCode(promoCode);
        
        this.addResult(testName, true, undefined, { 
          promoCode: validatedPromoCode.code,
          discountType: validatedPromoCode.discount_type,
          discountValue: validatedPromoCode.discount_value,
          isMemberOnly: validatedPromoCode.is_member_only
        });
      } else {
        // No promotional code found, which is also valid
        this.addResult(testName, true, undefined, { 
          message: 'No promotional code found (this is valid)',
          promoCode: null
        });
      }
      console.log('✅ Promotional Codes Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Promotional Codes Test failed:', error);
    }
  }

  private async testProductReviews(): Promise<void> {
    const testName = 'Product Reviews Test';
    const startTime = Date.now();

    try {
      if (!this.testData.products || this.testData.products.length === 0) {
        throw new Error('Prerequisites not met: products not available');
      }

      const product = this.testData.products[0];
      const reviewsResponse = await publicStoreApi.getProductReviews(product.id);
      
      // Validate reviews structure
      const validatedReviews = StoreDataValidator.validateProductReviews(reviewsResponse.reviews);

      this.addResult(testName, true, undefined, { 
        productId: product.id,
        productName: product.name,
        reviewsCount: validatedReviews.length,
        pagination: reviewsResponse.pagination
      });
      console.log('✅ Product Reviews Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Product Reviews Test failed:', error);
    }
  }

  private async testDataTypeConsistency(): Promise<void> {
    const testName = 'Data Type Consistency Test';
    const startTime = Date.now();

    try {
      const issues: string[] = [];

      // Test category data types
      if (this.testData.categories) {
        this.testData.categories.forEach((category, index) => {
          if (typeof category.id !== 'number') issues.push(`Category ${index}: ID is not a number`);
          if (typeof category.name !== 'string') issues.push(`Category ${index}: Name is not a string`);
          if (typeof category.is_active !== 'boolean') issues.push(`Category ${index}: is_active is not a boolean`);
        });
      }

      // Test product data types
      if (this.testData.products) {
        this.testData.products.forEach((product, index) => {
          if (typeof product.price !== 'number') issues.push(`Product ${index}: Price is not a number`);
          if (typeof product.stock_quantity !== 'number') issues.push(`Product ${index}: Stock quantity is not a number`);
          if (typeof product.is_active !== 'boolean') issues.push(`Product ${index}: is_active is not a boolean`);
        });
      }

      // Test cart data types
      if (this.testData.cart) {
        if (typeof this.testData.cart.id !== 'number') issues.push('Cart ID is not a number');
        if (this.testData.cart.guest_email && typeof this.testData.cart.guest_email !== 'string') {
          issues.push('Cart guest email is not a string');
        }
      }

      // Test order data types
      if (this.testData.order) {
        if (typeof this.testData.order.final_amount !== 'number') issues.push('Order final amount is not a number');
        if (typeof this.testData.order.order_status !== 'string') issues.push('Order status is not a string');
        if (!['pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled'].includes(this.testData.order.order_status)) {
          issues.push('Order status has invalid value');
        }
      }

      if (issues.length > 0) {
        throw new Error(`Data type consistency issues found: ${issues.join(', ')}`);
      }

      this.addResult(testName, true, undefined, { 
        categoriesChecked: this.testData.categories?.length || 0,
        productsChecked: this.testData.products?.length || 0,
        cartChecked: !!this.testData.cart,
        orderChecked: !!this.testData.order
      });
      console.log('✅ Data Type Consistency Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Data Type Consistency Test failed:', error);
    }
  }

  private async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling Test';
    const startTime = Date.now();

    try {
      const errors: string[] = [];

      // Test invalid cart ID
      try {
        await publicStoreApi.getCart(999999);
        errors.push('Should have thrown error for invalid cart ID');
      } catch (error) {
        // Expected error
      }

      // Test invalid order number
      try {
        await publicStoreApi.getOrderByNumber('INVALID-ORDER-123');
        errors.push('Should have thrown error for invalid order number');
      } catch (error) {
        // Expected error
      }

      // Test invalid promotional code
      try {
        await publicStoreApi.validatePromotionalCode('INVALID-CODE-123');
        // This might not throw an error, which is fine
      } catch (error) {
        // Expected error
      }

      if (errors.length > 0) {
        throw new Error(`Error handling issues: ${errors.join(', ')}`);
      }

      this.addResult(testName, true, undefined, { 
        errorScenariosTested: 3,
        errorHandlingWorking: true
      });
      console.log('✅ Error Handling Test passed');
    } catch (error) {
      this.addResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error Handling Test failed:', error);
    }
  }

  // ==============================================
  // HELPER METHODS
  // ==============================================

  private addResult(testName: string, success: boolean, error?: string, details?: any): void {
    const result: TestResult = {
      testName,
      success,
      error,
      details,
      duration: Date.now() - Date.now() // Will be calculated properly in actual implementation
    };
    this.results.push(result);
  }

  private generateResults(totalDuration: number): IntegrationTestResults {
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;
    const totalTests = this.results.length;

    const summary = `Tests completed: ${passedTests}/${totalTests} passed, ${failedTests} failed`;

    return {
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      summary,
      timestamp: new Date().toISOString()
    };
  }

  private getCategoriesWithProducts(products: StoreItem[]): Record<string, number> {
    const categoryCounts: Record<string, number> = {};
    products.forEach(product => {
      const categoryName = product.category_name || 'Uncategorized';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    return categoryCounts;
  }

  private calculateCartTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      const itemTotal = (item.price_at_time - item.member_discount_applied) * item.quantity;
      return total + itemTotal;
    }, 0);
  }
}

// ==============================================
// EXPORT TEST INSTANCE
// ==============================================

export const storeIntegrationTest = new StoreIntegrationTest();

// ==============================================
// CONVENIENCE FUNCTION
// ==============================================

export async function runStoreIntegrationTests(): Promise<IntegrationTestResults> {
  return await storeIntegrationTest.runAllTests();
}
