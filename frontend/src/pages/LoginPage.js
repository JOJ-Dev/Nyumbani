import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const { loginUser } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    try {
      await loginUser(e);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <input type="email" name="email" placeholder="Enter email" required />
        </div>

        <div className="form-group">
          <input type="password" name="password" placeholder="Enter password" required />
        </div>

        <input type="submit" value="Login" className="login-button" />

        <p className="login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
