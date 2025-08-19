import React from 'react';

// The main App component that renders the unauthorized page.
const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        {/* SVG icon for a visual alert. */}
        <svg className="unauthorized-icon" xmlns="http://www.w3.org/20000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-message">
          You do not have the necessary permissions to view this page.
        </p>
        <button className="back-button" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
      
      {/* CSS styling for the component */}
      <style>
        {`
          /* Use a modern, easy-to-read font */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          :root {
            --primary-color: #ef4444; /* A vibrant red for warnings */
            --text-color-dark: #333;
            --text-color-light: #6b7280;
            --bg-color-light: #f3f4f6;
            --card-bg-color: #ffffff;
            --border-color: #e5e7eb;
          }

          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            background-color: var(--bg-color-light);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: var(--text-color-dark);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .unauthorized-container {
            width: 100%;
            padding: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .unauthorized-card {
            background-color: var(--card-bg-color);
            padding: 2.5rem 2rem;
            border-radius: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
            max-width: 400px;
            width: 100%;
            border: 1px solid var(--border-color);
          }

          .unauthorized-icon {
            color: var(--primary-color);
            width: 6rem;
            height: 6rem;
            margin: 0 auto 1.5rem;
          }

          .unauthorized-title {
            font-size: 2.25rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 0 0 0.5rem;
          }

          .unauthorized-message {
            font-size: 1rem;
            color: var(--text-color-light);
            margin: 0 0 2rem;
          }

          .back-button {
            background-color: var(--primary-color);
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.1s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .back-button:hover {
            background-color: #dc2626;
            transform: translateY(-2px);
          }

          .back-button:active {
            transform: translateY(0);
            box-shadow: none;
          }
        `}
      </style>
    </div>
  );
};

export default UnauthorizedPage;
