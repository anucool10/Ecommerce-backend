'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const API_URL = 'http://localhost:8080/product';
const FALLBACK_IMG = 'https://picsum.photos/seed/placeholder/400/400';

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError('Could not load products. Is the backend running on port 8080?');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  // Load products + cart
  useEffect(() => {
    loadProducts();
    setCart(readCart());

    // Keep cart count in sync if it changes in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart') setCart(readCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addToCart = (product: Product) => {
    const current = readCart();
    const existing = current.find((i) => i.product.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        showToast(`Only ${product.stockQuantity} in stock`);
        return;
      }
      existing.quantity += 1;
    } else {
      current.push({ product, quantity: 1 });
    }

    writeCart(current);
    setCart(current);
    showToast(`Added "${product.name}" to cart`);
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const inCartQty = (id: number) => cart.find((i) => i.product.id === id)?.quantity ?? 0;

  const visibleProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        p &&
        p.name &&
        (p.name.toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term))
    );

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'name':
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, searchTerm, sort]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight">
            E-Store
          </Link>

          <nav className="flex items-center gap-5">
            <Link href="/" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-indigo-600">
              Shop
            </Link>
            <Link href="/orders" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              My Orders
            </Link>
            <Link href="/admin/products/new" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-indigo-600">
              Admin
            </Link>
            <Link
              href="/cart"
              className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              🛒 Cart
              <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title + controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop all products</h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${visibleProducts.length} product${visibleProducts.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 border bg-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border bg-white px-3 py-2 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-9 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border rounded-xl shadow-sm">
            <p className="text-rose-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Try again
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border rounded-xl shadow-sm">
            <p className="text-gray-700 text-lg font-medium">No products found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try a different search.' : 'Add some products from the admin page.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-indigo-600 text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => {
              const outOfStock = product.stockQuantity <= 0;
              const qty = inCartQty(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white border rounded-xl p-4 shadow-sm flex flex-col hover:shadow-md transition"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                    <img
                      src={product.imageUrl || FALLBACK_IMG}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                      className={`w-full h-full object-cover ${outOfStock ? 'opacity-50' : ''}`}
                    />
                    {outOfStock && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        Sold out
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">
                    {product.description || 'No description available.'}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        outOfStock
                          ? 'text-rose-500'
                          : product.stockQuantity <= 5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {outOfStock
                        ? 'Out of stock'
                        : product.stockQuantity <= 5
                        ? `Only ${product.stockQuantity} left`
                        : 'In stock'}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {outOfStock ? 'Unavailable' : qty > 0 ? `Add another (${qty} in cart)` : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-30">
          {toast}
        </div>
      )}
    </div>
  );
}