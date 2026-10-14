'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartProduct {
  id: number;
  name: string;
  price: number;
  stockQuantity?: number;
  imageUrl?: string | null;
}

interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface OrderResponse {
  id: string;
  trackingNumber?: string;
  [key: string]: any;
}

const FALLBACK_IMG = 'https://picsum.photos/seed/placeholder/300/300';

// Inner component for the Stripe payment form
function StripeCheckoutForm({
  subtotal,
  onBack,
  onSuccess,
}: {
  subtotal: number;
  onBack: () => void;
  onSuccess: (data: OrderResponse) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    // 1. Trigger form validation and element submission synchronously as required by Stripe
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Validation failed.');
      setLoading(false);
      return;
    }

    try {
      // 2. Call your Spring Boot backend to create the PaymentIntent after validation passes
      const res = await fetch('http://localhost:8080/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: subtotal }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const clientSecret = data.clientSecret;

      // 3. Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unknown payment error occurred.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to payment server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
          {errorMessage}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-1/3 border py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition text-sm disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-2/3 py-2.5 rounded-full font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-500 transition text-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay £${subtotal.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function CartPage() {
  const [userId, setUserId] = useState<number>(1);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'payment'>('cart');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const fixed = parsed
            .map((item) => ({
              ...item,
              quantity:
                item.product.stockQuantity !== undefined
                  ? Math.min(item.quantity, item.product.stockQuantity)
                  : item.quantity,
            }))
            .filter((item) => item.quantity > 0);

          setCartItems(fixed);
        }
      }
    } catch (e) {
      console.error('Could not read cart', e);
    }
    setLoaded(true);
  }, []);

  const saveCart = (next: CartItem[]) => {
    setCartItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const updateQuantity = (id: number, delta: number) => {
    const next = cartItems
      .map((item) => {
        if (item.product.id !== id) {
          return item;
        }
        const max = item.product.stockQuantity ?? Infinity;
        return {
          ...item,
          quantity: Math.min(item.quantity + delta, max),
        };
      })
      .filter((item) => item.quantity > 0);

    saveCart(next);
  };

  const removeItem = (id: number) => {
    saveCart(cartItems.filter((item) => item.product.id !== id));
  };

  const startCheckout = () => {
    setOrderSuccess(null);
    setError(null);
    setStep('payment');
  };

  const returnToCart = () => {
    setOrderSuccess(null);
    setError(null);
    setStep('cart');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-12">
      <header className="bg-slate-900 text-white mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            onClick={() => {
              setOrderSuccess(null);
              setError(null);
              setStep('cart');
            }}
            className="text-lg font-semibold hover:text-amber-400 transition"
          >
            ← Continue Shopping
          </Link>

          <span className="text-sm text-slate-300">
            🛒 {itemCount} item{itemCount !== 1 && 's'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {orderSuccess ? (
          <div className="bg-white border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">
              Order placed, thank you! 🎉
            </h2>
            <p className="text-gray-600 mb-2">
              Your order #{orderSuccess.id} was processed successfully.
            </p>
            {orderSuccess.trackingNumber && (
              <p className="text-gray-600 mb-6">
                Tracking number: {orderSuccess.trackingNumber}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2.5 rounded-full font-medium transition"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                onClick={() => {
                  setOrderSuccess(null);
                  setError(null);
                  setStep('cart');
                }}
                className="inline-block border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-full font-medium transition"
              >
                Return to Store
              </Link>
            </div>
          </div>
        ) : step === 'payment' ? (
          <div className="max-w-md mx-auto bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1">Secure Checkout</h2>
            <p className="text-xs text-gray-500 mb-6">
              Enter your payment details via Stripe.
            </p>

            <Elements
              stripe={stripePromise}
              options={{
                mode: 'payment',
                amount: Math.round(subtotal * 100),
                currency: 'gbp',
              }}
            >
              <StripeCheckoutForm
                subtotal={subtotal}
                onBack={returnToCart}
                onSuccess={(data) => {
                  setOrderSuccess(data);
                  saveCart([]);
                  setStep('cart');
                }}
              />
            </Elements>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-end border-b pb-3 mb-2">
                <h1 className="text-2xl font-medium">Shopping Cart</h1>
                <span className="text-sm text-gray-500">Price</span>
              </div>

              {!loaded ? (
                <div className="py-16 text-center text-gray-400">
                  Loading cart...
                </div>
              ) : cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xl mb-2">Your cart is empty</p>
                  <Link href="/" className="text-indigo-600 hover:underline text-sm">
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="divide-y">
                  {cartItems.map((item) => {
                    const atMax =
                      item.product.stockQuantity !== undefined &&
                      item.quantity >= item.product.stockQuantity;

                    return (
                      <li key={item.product.id} className="py-5 flex gap-5">
                        <div className="w-28 h-28 sm:w-40 sm:h-40 shrink-0 bg-gray-50 rounded-md overflow-hidden border">
                          <img
                            src={item.product.imageUrl || FALLBACK_IMG}
                            alt={item.product.name}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-4">
                            <h3 className="text-lg font-medium text-slate-900 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-lg font-bold whitespace-nowrap">
                              £{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <p className="text-sm text-emerald-700 mt-1">In Stock</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            £{item.product.price.toFixed(2)} each
                          </p>

                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center border-2 border-amber-400 rounded-full overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="px-3 py-1 font-bold hover:bg-amber-50 transition"
                                aria-label="Decrease quantity"
                              >
                                {item.quantity === 1 ? '🗑' : '−'}
                              </button>
                              <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                disabled={atMax}
                                className="px-3 py-1 font-bold hover:bg-amber-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-gray-300">|</span>

                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>

                          {atMax && (
                            <p className="text-xs text-amber-600 mt-2">
                              Max stock reached ({item.product.stockQuantity})
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {cartItems.length > 0 && (
                <div className="text-right text-lg pt-4 border-t">
                  Subtotal ({itemCount} item{itemCount !== 1 && 's'}):{' '}
                  <span className="font-bold">£{subtotal.toFixed(2)}</span>
                </div>
              )}
            </section>

            <aside className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-6">
              <p className="text-sm text-emerald-700 mb-2">
                ✓ Your order qualifies for FREE shipping
              </p>

              <p className="text-lg mb-4">
                Subtotal ({itemCount} item{itemCount !== 1 && 's'}):{' '}
                <span className="font-bold">£{subtotal.toFixed(2)}</span>
              </p>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Customer User ID
              </label>

              <input
                type="number"
                min="1"
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded-md mb-4 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Enter User ID"
              />

              <button
                onClick={startCheckout}
                disabled={cartItems.length === 0 || !loaded}
                className="w-full py-2.5 rounded-full font-medium text-slate-900 bg-amber-400 hover:bg-amber-500 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              {error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
                  {error}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}