'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

const API_URL = 'http://localhost:8080/product';
const FALLBACK_IMG = 'https://picsum.photos/seed/placeholder/100/100';
const LOW_STOCK = 5;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const stats = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK).length,
      out: products.filter((p) => p.stockQuantity <= 0).length,
      units: products.reduce((s, p) => s + Math.max(p.stockQuantity, 0), 0),
    }),
    [products]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (term && !p.name?.toLowerCase().includes(term)) return false;
        if (filter === 'low') return p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK;
        if (filter === 'out') return p.stockQuantity <= 0;
        return true;
      })
      .sort((a, b) => a.id - b.id);
  }, [products, search, filter]);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
      imageUrl: p.imageUrl ?? '',
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (original: Product) => {
    const price = parseFloat(draft.price);
    const stock = parseInt(draft.stockQuantity, 10);

    if (!draft.name.trim()) return showToast('Name cannot be empty', false);
    if (!draft.description.trim()) return showToast('Description cannot be empty', false);
    if (isNaN(price) || price <= 0) return showToast('Price must be greater than 0', false);
    if (isNaN(stock) || stock < 0) return showToast('Stock cannot be negative', false);

    // Send the FULL product so the backend never resets a field to null/0
    const body = {
      ...original,
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      stockQuantity: stock,
      imageUrl: draft.imageUrl.trim() || null,
    };

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${original.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Status:', res.status, 'Body:', text);
        throw new Error(`Save failed (${res.status})`);
      }

      const updated: Product = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === original.id ? { ...p, ...updated } : p)));
      setEditingId(null);
      showToast(`Saved "${updated.name ?? body.name}"`);
    } catch (err: any) {
      showToast(
        err.message === 'Failed to fetch' ? 'Could not reach backend' : err.message,
        false
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/${p.id}/delete`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        console.error('Status:', res.status, 'Body:', text);
        throw new Error(
          res.status === 500
            ? 'Cannot delete (it may be part of an existing order)'
            : `Delete failed (${res.status})`
        );
      }
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      showToast(`Deleted "${p.name}"`);
    } catch (err: any) {
      showToast(err.message, false);
    }
  };

  const stockBadge = (qty: number) => {
    if (qty <= 0) return 'bg-rose-100 text-rose-700';
    if (qty <= LOW_STOCK) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  const inputCls =
    'w-full border rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight">
              E-Store
            </Link>
            <span className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded">
              ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">
              Store
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-indigo-600">
              Orders
            </Link>
            <Link
              href="/admin/products/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Product
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Products', value: stats.total, cls: 'text-gray-900' },
            { label: 'Units in stock', value: stats.units, cls: 'text-gray-900' },
            { label: `Low stock (≤${LOW_STOCK})`, value: stats.low, cls: 'text-amber-600' },
            { label: 'Out of stock', value: stats.out, cls: 'text-rose-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase font-semibold text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.cls}`}>{loading ? '–' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border bg-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex bg-white border rounded-lg shadow-sm overflow-hidden text-sm">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium transition ${
                  filter === f ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {f === 'all' ? 'All' : f === 'low' ? 'Low stock' : 'Out of stock'}
              </button>
            ))}
          </div>
          <button
            onClick={loadProducts}
            className="bg-white border px-4 py-2 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white border rounded-xl p-6 space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
            <p className="text-rose-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm text-gray-500">
            No products match.
          </div>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 w-16">ID</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3 min-w-[240px]">Description</th>
                  <th className="text-left px-4 py-3 w-32">Price</th>
                  <th className="text-left px-4 py-3 w-36">Stock left</th>
                  <th className="text-right px-4 py-3 w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((p) => {
                  const editing = editingId === p.id;

                  return (
                    <tr key={p.id} className={editing ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-500 align-top">#{p.id}</td>

                      {/* Product */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <img
                            src={(editing ? draft.imageUrl : p.imageUrl) || FALLBACK_IMG}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                            className="w-12 h-12 rounded-md object-cover border shrink-0"
                          />
                          {editing ? (
                            <div className="space-y-2 min-w-[180px]">
                              <input
                                className={inputCls}
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                placeholder="Name"
                              />
                              <input
                                className={inputCls}
                                value={draft.imageUrl}
                                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                                placeholder="Image URL"
                              />
                            </div>
                          ) : (
                            <span className="font-medium">{p.name}</span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 align-top">
                        {editing ? (
                          <textarea
                            rows={3}
                            className={inputCls}
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                          />
                        ) : (
                          <p className="text-gray-600 line-clamp-2">{p.description}</p>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 align-top">
                        {editing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className={inputCls}
                            value={draft.price}
                            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                          />
                        ) : (
                          <span className="font-semibold">${Number(p.price).toFixed(2)}</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 align-top">
                        {editing ? (
                          <input
                            type="number"
                            min="0"
                            className={inputCls}
                            value={draft.stockQuantity}
                            onChange={(e) => setDraft({ ...draft, stockQuantity: e.target.value })}
                          />
                        ) : (
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(
                              p.stockQuantity
                            )}`}
                          >
                            {p.stockQuantity <= 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        {editing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => saveEdit(p)}
                              disabled={saving}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="border px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              className="border px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p)}
                              className="border border-rose-200 text-rose-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-rose-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-30 ${
            toast.ok ? 'bg-slate-900' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}