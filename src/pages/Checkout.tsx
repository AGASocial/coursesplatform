import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Mail, AlertCircle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { createOrder } from '../lib/orders';

export const Checkout = () => {
  const navigate = useNavigate();
  const { state: cart, clearCart } = useCart();
  const { user } = useAuth();
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    navigate('/courses');
    return null;
  }

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleCompletePurchase = async () => {
    setLoading(true);
    setError('');

    const { success, error: orderError } = await createOrder(
      user.uid,
      user.email!,
      cart.items,
      cart.total
    );

    if (!success) {
      setError(orderError || 'Failed to create order');
      setLoading(false);
      return;
    }

    setPurchaseComplete(true);
    // Clear the cart after 3 seconds and redirect to courses
    setTimeout(() => {
      clearCart();
      navigate('/courses');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {purchaseComplete ? (
            <div className="rounded-2xl bg-green-50 p-8 shadow-lg transform animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-green-900 text-center">Thank you for your purchase!</h2>
              <p className="mt-4 text-lg text-green-700 text-center">
                Please check your email for course access instructions.
              </p>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
              {/* Cart summary */}
              <div className="lg:col-span-7">
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <div className="mt-8 space-y-6">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="mt-2 text-sm text-gray-500">by {item.instructor}</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900">${item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <dl className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <dt className="text-base text-gray-600">Subtotal</dt>
                      <dd className="text-base font-medium text-gray-900">${cart.total.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                      <dt className="text-lg font-semibold text-gray-900">Order total</dt>
                      <dd className="text-lg font-semibold text-blue-600">${cart.total.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Payment information */}
              <div className="mt-10 lg:col-span-5 lg:mt-0">
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">Payment Methods</h2>
                  </div>

                  <div className="mt-8 space-y-6">
                    {/* Zelle Payment */}
                    <div className="rounded-xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Zelle</h3>
                      </div>
                      <p className="mt-4 text-base text-gray-600">
                        Send payment to: <span className="font-semibold text-gray-900">info@aga.social</span>
                      </p>
                    </div>

                    {/* PayPal Payment */}
                    <div className="rounded-xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h7.815c2.604 0 4.429.715 5.445 2.135.463.659.77 1.466.883 2.385.117.961.006 2.203-.33 3.604l-.002.01v.01c-.401 2.053-1.23 3.83-2.45 5.238-1.203 1.389-2.736 2.373-4.558 2.931-1.772.547-3.78.547-5.989.547h-.767c-.612 0-1.137.437-1.24 1.037l-1.265 5.766a.642.642 0 0 1-.63.512H2.47z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
                      </div>
                      <p className="mt-4 text-base text-gray-600">
                        Send payment to: <span className="font-semibold text-gray-900">info@aga.social</span>
                      </p>
                    </div>

                    {/* Important Notice */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                      <div className="flex items-start">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-blue-900">Important</h3>
                          <div className="mt-3 text-base text-blue-800">
                            <p>After sending payment, please email your transaction details to info@aga.social including:</p>
                            <ul className="mt-4 list-disc pl-5 space-y-2">
                              <li>Your registered email</li>
                              <li>Transaction ID or reference number</li>
                              <li>Course(s) purchased</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-xl bg-red-50 p-6 text-base text-red-600 border border-red-100">
                        {error}
                      </div>
                    )}

                    {/* Complete Purchase Button */}
                    <Button
                      className="w-full py-6 text-lg font-semibold transition-transform duration-200 hover:transform hover:scale-[1.02]"
                      onClick={handleCompletePurchase}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Complete Purchase'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};