import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiExternalLink } from 'react-icons/fi';
import api from '../api';
import './PaymentHistory.css';

const PaymentHistory = ({ tenantId }) => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentData();
    }, [tenantId]);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            const [summaryResponse, paymentsResponse] = await Promise.all([
                api.get('/payments/tenant-payment-summary/'),
                api.get(`/payments/?tenant_id=${tenantId}`)
            ]);
            
            setSummary(summaryResponse.data);
            setPayments(paymentsResponse.data);
        } catch (err) {
            setError('Failed to fetch payment data');
            console.error('Error fetching payment data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FiCheckCircle className="status-icon success" />;
            case 'pending':
                return <FiClock className="status-icon warning" />;
            case 'failed':
                return <FiXCircle className="status-icon error" />;
            default:
                return <FiClock className="status-icon info" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'failed':
                return 'status-failed';
            default:
                return 'status-default';
        }
    };

    if (loading) {
        return <div className="payment-history loading">Loading payment data...</div>;
    }

    if (error) {
        return <div className="payment-history error">{error}</div>;
    }

    return (
        <div className="payment-history">
            <h3>Payment History</h3>
            
            {summary && (
                <div className="payment-summary">
                    <div className="summary-card">
                        <h4>Payment Summary</h4>
                        <div className="summary-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Paid:</span>
                                <span className="stat-value">KES {summary.total_paid?.toLocaleString()}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Outstanding:</span>
                                <span className="stat-value">KES {summary.outstanding_balance?.toLocaleString()}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Completed:</span>
                                <span className="stat-value">{summary.completed_payments}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Pending:</span>
                                <span className="stat-value">{summary.pending_payments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="payments-list">
                <h4>Recent Payments</h4>
                {payments.length === 0 ? (
                    <p className="no-payments">No payments found</p>
                ) : (
                    <div className="payments-grid">
                        {payments.map((payment) => (
                            <div key={payment.id} className={`payment-card ${getStatusClass(payment.status)}`}>
                                <div className="payment-header">
                                    {getStatusIcon(payment.status)}
                                    <div className="payment-amount">
                                        <span className="amount">KES {payment.amount?.toLocaleString()}</span>
                                        <span className="date">{new Date(payment.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="payment-details">
                                    <p className="property-address">{payment.property_address}</p>
                                    <p className={`status ${getStatusClass(payment.status)}`}>
                                        {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                                    </p>
                                </div>
                                {payment.stripe_receipt_url && (
                                    <a 
                                        href={payment.stripe_receipt_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="receipt-link"
                                    >
                                        <FiExternalLink /> View Receipt
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
