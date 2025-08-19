import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext';
import styles from './PaymentForm.module.css';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_your_stripe_publishable_key');

// helper to normalize token retrieval
const getAuthToken = () => {
  const raw = localStorage.getItem('authTokens') || localStorage.getItem('token');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.access || parsed.token)) return parsed.access || parsed.token;
  } catch (e) {
    // raw is a plain token string
    return raw;
  }
  return null;
};

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
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found (check localStorage key)');
      }
      // debug: remove in production
      console.debug('Using auth token (first 8 chars):', token ? token.substring(0, 8) + '...' : null);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      if (!data.client_secret) {
        throw new Error('No client secret received from server');
      }

      setClientSecret(data.client_secret);
      setPaymentId(data.payment_id);
      return data.client_secret;
      
    } catch (err) {
      setError(err.message);
      throw err;
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

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      setIsLoading(false);
      return;
    }

    try {
      // Create payment intent first if not already created
      let currentClientSecret = clientSecret;
      if (!currentClientSecret) {
        currentClientSecret = await createPaymentIntent();
      }

      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Tenant Name',
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setError(null);
        onPaymentComplete();
        setAmount('');
        setClientSecret(null);
        setPaymentId(null);
        setIsLoading(false);
      } else {
        setError(`Payment status: ${paymentIntent ? paymentIntent.status : 'unknown'}`);
        setIsLoading(false);
      }
        
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setClientSecret(null); // Reset client secret when amount changes
      setError(null);
    }
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
          step="0.01"
          required
          placeholder="Enter amount"
          disabled={isLoading}
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
        disabled={isLoading || !amount || !stripe || !elements}
      >
        {isLoading ? 'Processing...' : 'Pay with Card'}
      </button>
    </form>
  );
};

const StripePaymentForm = () => {
  const { user } = useContext(AuthContext);
  const tenantId = user?.id;
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('No authentication token found (check localStorage)');
          return;
        }
        // debug: remove in production
        console.debug('Using auth token (first 8 chars):', token ? token.substring(0, 8) + '...' : null);

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
      } catch (err) {
        console.error('Error fetching payment history:', err);
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
