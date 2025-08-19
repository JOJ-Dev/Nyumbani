import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/GlobalStyles.css'

const HomePage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="homepage">
            <div className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Welcome to Nyumbani</h1>
                        <p className="hero-subtitle">
                            Your complete property management solution for landlords and tenants
                        </p>
                        
                        {user ? (
                            <div className="user-welcome">
                                <div className="welcome-card">
                                    <h2>Welcome back, {user.email}!</h2>
                                    <p>You are successfully logged in.</p>
                                    <div className="action-buttons">
                                        <Link to="/dashboard-redirect" className="btn btn-primary">
                                            Go to Dashboard
                                        </Link>
                                        <Link to="/profile" className="btn btn-secondary">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-section">
                                <div className="auth-cards">
                                    <div className="auth-card">
                                        <h3>Landlords</h3>
                                        <p>Manage your properties, track payments, and communicate with tenants</p>
                                        <Link to="/register" className="btn btn-primary">
                                            Get Started as Landlord
                                        </Link>
                                    </div>
                                    
                                    <div className="auth-card">
                                        <h3>Tenants</h3>
                                        <p>Pay rent, submit maintenance requests, and stay connected with your landlord</p>
                                        <Link to="/register" className="btn btn-primary">
                                            Register as Tenant
                                        </Link>
                                    </div>
                                </div>
                                
                                <div className="login-prompt">
                                    <p>Already have an account?</p>
                                    <Link to="/login" className="btn btn-secondary">
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="features-section">
                <div className="container">
                    <h2>Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Secure Payments</h3>
                            <p>Safe and secure online rent payments with Stripe integration</p>
                        </div>
                        <div className="feature-card">
                            <h3>Property Management</h3>
                            <p>Comprehensive tools for managing properties and tenants</p>
                        </div>
                        <div className="feature-card">
                            <h3>Real-time Updates</h3>
                            <p>Instant notifications and updates for all parties</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .homepage {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .hero-section {
                    padding: 4rem 0;
                    color: white;
                }
                
                .hero-content {
                    text-align: center;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }
                
                .hero-subtitle {
                    font-size: 1.25rem;
                    margin-bottom: 3rem;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                
                .welcome-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin: 2rem 0;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 1.5rem;
                    flex-wrap: wrap;
                }
                
                .auth-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin: 2rem 0;
                }
                
                .auth-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    text-align: center;
                }
                
                .auth-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: white;
                }
                
                .auth-card p {
                    margin-bottom: 1.5rem;
                    opacity: 0.9;
                }
                
                .login-prompt {
                    margin-top: 2rem;
                }
                
                .features-section {
                    background: white;
                    padding: 4rem 0;
                }
                
                .features-section h2 {
                    text-align: center;
                    font-size: 2.5rem;
                    margin-bottom: 3rem;
                    color: var(--gray-800);
                }
                
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                .feature-card {
                    background: var(--gray-50);
                    padding: 2rem;
                    border-radius: 1rem;
                    text-align: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .feature-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--gray-800);
                }
                
                .feature-card p {
                    color: var(--gray-600);
                    line-height: 1.6;
                }
                
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .hero-subtitle {
                        font-size: 1.1rem;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .auth-cards {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default HomePage
