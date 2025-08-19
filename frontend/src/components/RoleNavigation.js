// src/components/RoleNavigation.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const RoleNavigation = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav>
            {user.is_landlord && (
                <>
                    <Link to="/landlord-dashboard">Dashboard</Link>
                    <Link to="/landlord-properties">My Properties</Link>
                </>
            )}
            {user.is_tenant && (
                <>
                    <Link to="/tenant-dashboard">Dashboard</Link>
                    <Link to="/tenant-rentals">My Rentals</Link>
                </>
            )}
            <Link to="/profile">Profile</Link>
        </nav>
    );
};

export default RoleNavigation;