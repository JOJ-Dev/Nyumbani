import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Header.css'

const Header = () => {
    let { user, logoutUser } = useContext(AuthContext)

    return (
        <header className="header">
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <span className="separator">|</span>
                {user ? (
                    <div className="user-info">
                        <span className="user-email">{user.email}</span>
                        <button onClick={logoutUser} className="logout-btn">Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="nav-link">Login</Link>
                )}
            </div>
        </header>
    )
}

export default Header