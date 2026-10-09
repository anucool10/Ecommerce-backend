'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface OrderItem {
  id?: number;
  productName?: string;
  product?: { name?: string; imageUrl?: string | null };
  quantity: number;
  price?: number;
  priceAtPurchase?: number;
}

interface Order {
  id: number;
  userId?: number;
  user?: { id: number; name?: string; email?: string };
  totalPrice?: number;
  orderDate?: string;
  status?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
}

const API_URL = 'http://localhost:8080/orders';
const FALLBACK_IMG = 'https://picsum.photos/seed/placeholder/100/100';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const loadOrders = () => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 404 || res.status === 405
              ? 'Your backend has no GET /orders endpoint yet.'
              : `Server returned ${res.status}`
          );
        }
        return res.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError(
          err.message === 'Failed to fetch'
            ? 'Could not reach the backend. Is it running on port 8080?'
            : err.message
        );
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, []);

  const getUserId = (o: Order) => o.userId ?? o.user?.id;

  const visibleOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => b.id - a.id); // newest first
    if (!userFilter.trim()) return sorted;
    return sorted.filter((o) => String(getUserId(o)) === userFilter.trim());
  }, [orders, userFilter]);

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null;

  const statusStyle = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight">
            E-Store
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Shop
            </Link>
            <Link href="/orders" className="text-sm font-semibold text-indigo-600">
              My Orders
            </Link>
            <Link
              href="/cart"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              🛒 Cart
              <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
            <p className="text-gray-500 mt-1">
              {loading
                ? 'Loading...'
                : `${visibleOrders.length} order${visibleOrders.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <input
            type="number"
            placeholder="Filter by User ID"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border bg-white px-4 py-2 rounded-lg shadow-sm w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
            <p className="text-rose-600 font-medium">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Try again
            </button>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {userFilter ? 'No orders for that user ID.' : 'Place an order and it will show up here.'}
            </p>
            <Link
              href="/"
              className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {visibleOrders.map((order) => {
              const items = order.orderItems ?? order.items ?? [];

              return (
                <div key={order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="bg-gray-50 border-b px-6 py-4 flex flex-wrap justify-between gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">Order</p>
                      <p className="font-bold text-indigo-600">#{order.id}</p>
                    </div>
                    {formatDate(order.orderDate) && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold">Placed</p>
                        <p>{formatDate(order.orderDate)}</p>
                      </div>
                    )}
                    {getUserId(order) !== undefined && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold">Customer</p>
                        <p>
                          {order.user?.name ? `${order.user.name} (ID ${getUserId(order)})` : getUserId(order)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">Total</p>
                      <p className="font-bold">${Number(order.totalPrice ?? 0).toFixed(2)}</p>
                    </div>
                    {order.status && (
                      <span
                        className={`self-center text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  {items.length === 0 ? (
                    <p className="px-6 py-4 text-sm text-gray-400">No item details returned.</p>
                  ) : (
                    <ul className="divide-y">
                      {items.map((item, idx) => {
                        const name = item.productName || item.product?.name || 'Product';
                        const unitPrice = item.priceAtPurchase ?? item.price;

                        return (
                          <li key={item.id ?? idx} className="px-6 py-3 flex items-center gap-4">
                            <img
                              src={item.product?.imageUrl || FALLBACK_IMG}
                              alt={name}
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                              className="w-14 h-14 rounded-md object-cover border"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                                {unitPrice !== undefined && ` × $${Number(unitPrice).toFixed(2)}`}
                              </p>
                            </div>
                            {unitPrice !== undefined && (
                              <p className="text-sm font-semibold">
                                ${(Number(unitPrice) * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}