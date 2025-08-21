import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import CartMachineCard from '@/components/public/CartMachineCard';
import { ShoppingCart, ArrowLeft, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { user, cart, updateCartItem, removeFromCart, clearCart } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your cart.</p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </Link>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600">{totalItems} items</p>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some products to your cart to get started.</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <CartMachineCard
                      key={item._id}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateCartItem}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Contact for Quote</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold text-blue-600">Contact for Quote</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/contact#contact-hero')}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Place Order
                  </button>
                  
                  <button
                    onClick={() => navigate('/contact#contact-hero')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Quote
                  </button>
                  
                  <button
                    onClick={clearCart}
                    className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash size={16} />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 