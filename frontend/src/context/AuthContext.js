import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import "core-js/stable/atob";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        try {
            const tokens = localStorage.getItem('authTokens');
            return tokens ? JSON.parse(tokens) : null;
        } catch (error) {
            console.error("Failed to parse auth tokens:", error);
            return null;
        }
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Memoized logout function
    const logoutUser = useCallback(() => {
        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // Fetch user details with proper error handling
    const fetchUserDetails = useCallback(async () => {
        if (!authTokens) return false;
        
        try {
            const response = await api.get('http://127.0.0.1:8000/auth/user-info/');
            setUser(prev => ({
                ...prev,
                ...response.data,
                landlord: response.data.landlord || false,
                tenant: response.data.tenant || false
            }));
            return true;
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            logoutUser();
            return false;
        }
    }, [authTokens, logoutUser]);

    // Token refresh logic
    const updateToken = useCallback(async () => {
        if (!authTokens?.refresh) {
            logoutUser();
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: authTokens.refresh })
            });

            const data = await response.json();
            
            if (response.status === 200) {
                setAuthTokens(data);
                const decoded = jwtDecode(data.access);
                setUser({
                    ...decoded,
                    landlord: decoded.landlord || false,
                    tenant: decoded.tenant || false
                });
                localStorage.setItem('authTokens', JSON.stringify(data));
                await fetchUserDetails();
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            logoutUser();
        } finally {
            if (loading) setLoading(false);
        }
    }, [authTokens, fetchUserDetails, logoutUser, loading]);

    // Login handler
    const loginUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: e.target.email.value, 
                    password: e.target.password.value 
                })
            });

            const data = await response.json();

            if (!response.ok || !data) {
                throw new Error(data?.detail || 'Invalid credentials');
            }

            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            const decoded = jwtDecode(data.access);
            
            const newUser = {
                ...decoded,
                landlord: decoded.landlord || false,
                tenant: decoded.tenant || false
            };
            
            setUser(newUser);
            await fetchUserDetails();
            
            // Check if landlord has properties and redirect accordingly
            if (newUser.landlord) {
                try {
                    const propertyCountResponse = await api.get('http://127.0.0.1:8000/dashboard/properties/count/');
                    if (!propertyCountResponse.data.has_properties) {
                        navigate('/landlord-dashboard?firstLogin=true');
                    } else {
                        navigate('/landlord-dashboard');
                    }
                } catch (err) {
                    console.error('Error checking property count:', err);
                    navigate('/landlord-dashboard');
                }
            } else {
                navigate(newUser.tenant ? '/tenant-dashboard' : '/');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            if (authTokens) {
                try {
                    const decoded = jwtDecode(authTokens.access);
                    setUser({
                        ...decoded,
                        landlord: decoded.landlord || false,
                        tenant: decoded.tenant || false
                    });
                    
                    // Verify token validity
                    if (Date.now() >= decoded.exp * 1000) {
                        await updateToken();
                    } else {
                        await fetchUserDetails();
                    }
                } catch (error) {
                    console.error("Auth initialization error:", error);
                    logoutUser();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [authTokens, fetchUserDetails, logoutUser, updateToken]);

    // Token refresh interval
    useEffect(() => {
        const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes
        let interval = setInterval(() => {
            if (authTokens) updateToken();
        }, REFRESH_INTERVAL);
        
        return () => clearInterval(interval);
    }, [authTokens, updateToken]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        loading,
        isAuthenticated: !!authTokens,
        landlord: user?.landlord || false,
        tenant: user?.tenant || false
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <div className="loading-screen">
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
