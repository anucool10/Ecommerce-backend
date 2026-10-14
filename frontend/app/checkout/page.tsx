'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key (from your Stripe Dashboard)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call your Spring Boot backend to create the PaymentIntent and get the clientSecret
      const res = await fetch('http://localhost:8080/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50.00 }), // Pass your order total here
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const clientSecret = data.clientSecret;

      // 2. Confirm the payment with Stripe using the clientSecret
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: 'http://localhost:3000/success', // Where to redirect after payment
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unknown error occurred.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to payment server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <PaymentElement className="mb-4" />
      <button
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {errorMessage && <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>}
    </form>
  );
}

// Wrapper component to provide the Stripe elements context
export default function CheckoutPage() {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-center mb-6">Complete Your Purchase</h2>
      <Elements stripe={stripePromise} options={{ mode: 'payment', amount: 5000, currency: 'gbp' }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}