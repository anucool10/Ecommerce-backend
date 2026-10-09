'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddProductAdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('http://localhost:8080/product/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Backend expects a List<Product>, so wrap in an array
        body: JSON.stringify([
          {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity || '0', 10),
            imageUrl: formData.imageUrl || null,
          },
        ]),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Status:', response.status, 'Body:', errorBody);
        throw new Error(`Failed (${response.status})`);
      }

      setStatusMessage('✅ Product successfully added to database!');
      setFormData({ name: '', description: '', price: '', stockQuantity: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Error adding product. Check the browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none';

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
            <Link href="/admin/products" className="text-gray-700 hover:text-indigo-600">
              Inventory
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
            <Link href="/admin/products" className="text-sm font-medium text-indigo-600 hover:underline">
              ← Back to Inventory
            </Link>
          </div>

          {statusMessage && (
            <div
              className={`p-4 mb-6 rounded-lg text-sm font-medium ${
                statusMessage.startsWith('✅')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Mechanical Keyboard"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  name="stockQuantity"
                  required
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="10"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://picsum.photos/seed/headphones/600/600"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product details..."
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Product...' : 'Publish Product'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}