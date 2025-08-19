import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLandlordDashboardData } from '../api';
import PropertyCreationModal from '../components/PropertyCreationModal';
import BulkPropertyCreationModal from '../components/BulkPropertyCreationModal';
import './LandlordDashboard.css';

const LandlordDashboard = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const firstLogin = urlParams.get('firstLogin') === 'true';
        setIsFirstLogin(firstLogin);
        
        if (firstLogin) {
            setShowPropertyModal(true);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await getLandlordDashboardData();
                setDashboardData(data.data);
                setError(null);
                
                // Check if no properties exist and show modal
                if (data.data.total_properties === 0 && !isFirstLogin) {
                    setShowPropertyModal(true);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load dashboard data');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isFirstLogin]);

    const handlePropertyCreated = (newProperty) => {
        // Refresh dashboard data after property creation
        const fetchDashboardData = async () => {
            try {
                const data = await getLandlordDashboardData();
                setDashboardData(data.data);
            } catch (err) {
                console.error('Error refreshing dashboard data:', err);
            }
        };
        fetchDashboardData();
    };

    const handleBulkPropertiesCreated = (newProperties) => {
        // Refresh dashboard data after bulk property creation
        const fetchDashboardData = async () => {
            try {
                const data = await getLandlordDashboardData();
                setDashboardData(data.data);
            } catch (err) {
                console.error('Error refreshing dashboard data:', err);
            }
        };
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="landlord-dashboard">
                <div className="loading-container">
                    <h1>Loading Dashboard...</h1>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="landlord-dashboard">
                <div className="error-container">
                    <h1>Error Loading Dashboard</h1>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    const { properties, recent_payments, total_properties, total_tenants, total_monthly_income, total_paid_this_month } = dashboardData;

    return (
        <div className="landlord-dashboard">
            <h1>Landlord Dashboard</h1>
            <p>Welcome, {dashboardData.landlord_name || user?.email || 'Landlord'}!</p>
            
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Your Properties Overview</h2>
                    <div className="action-buttons">
                        <button 
                            className="add-property-btn" 
                            onClick={() => setShowPropertyModal(true)}
                        >
                            Add Single Property
                        </button>
                        <button 
                            className="add-bulk-btn" 
                            onClick={() => setShowBulkModal(true)}
                        >
                            Add Multiple Properties
                        </button>
                    </div>
                </div>
                
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>Total Properties</h3>
                        <p>{total_properties || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Tenants</h3>
                        <p>{total_tenants || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Monthly Income</h3>
                        <p>KES {total_monthly_income?.toLocaleString() || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Paid This Month</h3>
                        <p className="amount">KES {total_paid_this_month?.toLocaleString() || 0}</p>
                        <p className="month-context">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="properties-section">
                    <h2>Your Properties</h2>
                    {properties && properties.length > 0 ? (
                        <div className="properties-grid">
                            {properties.map((property) => (
                                <div key={property.id} className="property-card">
                                    <h3>{property.address}</h3>
                                    <p><strong>Monthly Rent:</strong> KES {property.monthly_rent?.toLocaleString()}</p>
                                    <p><strong>Tenants:</strong> {property.tenant_count}</p>
                                    <p><strong>Status:</strong> {property.vacant ? 'Vacant' : 'Occupied'}</p>
                                    <p><strong>Total Paid:</strong> KES {property.paid_amount?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-properties">
                            <h3>No Properties Found</h3>
                            <p>You haven't added any properties yet. Click the button below to add your first property.</p>
                            <div className="action-buttons">
                                <button 
                                    className="add-property-btn" 
                                    onClick={() => setShowPropertyModal(true)}
                                >
                                    Add Property
                                </button>
                                <button 
                                    className="add-bulk-btn" 
                                    onClick={() => setShowBulkModal(true)}
                                >
                                    Add Multiple Properties
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {recent_payments && recent_payments.length > 0 && (
                    <div className="recent-payments-section">
                        <h2>Recent Payments</h2>
                        <div className="payments-list">
                            {recent_payments.map((payment) => (
                                <div key={payment.id} className="payment-item">
                                    <div className="payment-info">
                                        <h4>{payment.tenant_name}</h4>
                                        <p>{payment.property_address}</p>
                                        <p className="payment-amount">KES {payment.amount?.toLocaleString()}</p>
                                    </div>
                                    <div className="payment-date">
                                        {new Date(payment.payment_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <PropertyCreationModal
                show={showPropertyModal}
                onClose={() => setShowPropertyModal(false)}
                onPropertyCreated={handlePropertyCreated}
                isFirstLogin={isFirstLogin}
            />
            <BulkPropertyCreationModal
                show={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onPropertiesCreated={handleBulkPropertiesCreated}
            />
        </div>
    );
};

export default LandlordDashboard;
                            