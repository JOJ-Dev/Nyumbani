import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PaymentForm.module.css';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_your_stripe_publishable_key_here');

const CheckoutForm = ({ tenantId, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/payments/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          amount: parseFloat(amount)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.client_secret);
      setPaymentId(data.payment_id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet');
      setIsLoading(false);
      return;
    }

    // Create payment intent first if not already created
    if (!clientSecret) {
      await createPaymentIntent();
    }

    const cardElement = elements.getElement(CardElement);
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Tenant Name', // You can get this from user context
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Payment successful
      onPaymentComplete();
      setAmount('');
      setClientSecret(null);
      setPaymentId(null);
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setClientSecret(null); // Reset client secret when amount changes
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount (KES)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          min="1"
          required
          placeholder="Enter amount"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Card Details</label>
        <div className={styles.cardElement}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          <p>{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        className={styles.payButton}
        disabled={isLoading || !amount || !stripe}
      >
        {isLoading ? 'Processing...' : 'Pay with Card'}
      </button>
    </form>
  );
};

const StripePaymentForm = ({ tenantId }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch(`http://localhost:8000/payments/?tenant_id=${tenantId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please login again.');
          } else {
            throw new Error('Failed to fetch payments');
          }
          return;
        }
        
        const data = await response.json();
        setPaymentHistory(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        setError('Failed to load payment history');
      }
    };
    
    if (tenantId) {
      fetchPayments();
    }
  }, [tenantId, refreshKey]);

  const handlePaymentComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={styles.paymentContainer}>
      <h2 className={styles.title}>Make Payment</h2>
      
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          tenantId={tenantId} 
          onPaymentComplete={handlePaymentComplete} 
        />
      </Elements>

      <div className={styles.paymentHistory}>
        <h3>Payment History</h3>
        {paymentHistory.length === 0 ? (
          <p>No payment history found</p>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>KES {payment.amount}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      payment.status === 'completed' ? styles.completed :
                      payment.status === 'pending' ? styles.pending :
                      styles.failed
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.stripe_payment_intent_id ? payment.stripe_payment_intent_id.substring(0, 8) + '...' : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StripePaymentForm;
