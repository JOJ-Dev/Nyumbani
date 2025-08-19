import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import TenantPropertyAssignment from '../components/TenantPropertyAssignment';
import PaymentHistory from '../components/PaymentHistory';
import './TenantDashboard.css';
import { FiHome, FiDollarSign, FiClock, FiCheckCircle, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TenantDashboard = () => {
    const { user, authTokens } = useContext(AuthContext);
    const [tenantProfile, setTenantProfile] = useState(null);
    const [paymentSummary, setPaymentSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTenantData();
    }, [authTokens]);

    const fetchTenantData = async () => {
        try {
            setLoading(true);
            const [profileResponse, paymentResponse] = await Promise.all([
                api.get('http://127.0.0.1:8000/auth/tenant-profile/'),
                api.get('http://127.0.0.1:8000/payments/tenant-payment-summary/')
            ]);
            
            setTenantProfile(profileResponse.data);
            setPaymentSummary(paymentResponse.data);
        } catch (err) {
            setError('Failed to fetch tenant data');
            console.error('Error fetching tenant data:', err);
        } finally {
            setLoading(false);
        }
    };

    const makePayment = () => {
        navigate('/payment');
    };

    const getOutstandingAlert = () => {
        if (!paymentSummary || !tenantProfile) return null;
        
        const outstanding = paymentSummary.outstanding_balance;
        if (outstanding > 0) {
            return (
                <div className="outstanding-alert">
                    <FiAlertTriangle className="alert-icon" />
                    <div className="alert-content">
                        <h4>Outstanding Balance</h4>
                        <p>You have an outstanding balance of KES {outstanding.toLocaleString()}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="tenant-dashboard">Loading...</div>;
    }

    if (error) {
        return <div className="tenant-dashboard error">{error}</div>;
    }

    return (
        <div className="tenant-dashboard">
            <h1>Tenant Dashboard</h1>
            <p>Welcome back, {user?.email || 'Tenant'}!</p>
            
            {getOutstandingAlert()}
            
            <div className="dashboard-content">
                <h2>Your Rental Overview</h2>
                <p className="subtitle">Manage your rental agreements and payments</p>
                
                {tenantProfile?.property ? (
                    <>
                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <div className="stat-header">
                                    <FiHome className="stat-icon" />
                                    <h3>Current Property</h3>
                                </div>
                                <p>{tenantProfile.property}</p>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-header">
                                    <FiClock className="stat-icon" />
                                    <h3>Lease Start</h3>
                                </div>
                                <p>{new Date(tenantProfile.lease_start).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-header">
                                    <FiClock className="stat-icon" />
                                    <h3>Lease End</h3>
                                </div>
                                <p>{new Date(tenantProfile.lease_end).toLocaleDateString()}</p>
                            </div>
                            
                            {paymentSummary && (
                                <>
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <FiDollarSign className="stat-icon" />
                                            <h3>Monthly Rent</h3>
                                        </div>
                                        <p>KES {tenantProfile.monthly_rent?.toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <FiCheckCircle className="stat-icon" />
                                            <h3>Total Paid</h3>
                                        </div>
                                        <p>KES {paymentSummary.total_paid?.toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <FiFileText className="stat-icon" />
                                            <h3>Payments</h3>
                                        </div>
                                        <p>{paymentSummary.completed_payments} completed</p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="quick-actions">
                            <button className="action-btn primary" onClick={makePayment}>
                                <FiDollarSign /> Make Payment
                            </button>
                        </div>
                        
                        {user?.id && (
                            <PaymentHistory tenantId={user.id} />
                        )}
                    </>
                ) : (
                    <div className="no-property-section">
                        <h3>You haven't been assigned to a property yet</h3>
                        <p>Please select a property to complete your tenant registration</p>
                        <TenantPropertyAssignment />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantDashboard;
