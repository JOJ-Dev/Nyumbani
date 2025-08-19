import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TenantPropertyAssignment.css'; // Assuming you have a CSS file for styling

const TenantPropertyAssignment = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { authTokens } = useAuth();

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const fetchAvailableProperties = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/available-properties/', {
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/assign-tenant/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: parseInt(selectedProperty),
          lease_start: leaseStart,
          lease_end: leaseEnd,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Failed to assign property');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h3>Property Assigned Successfully!</h3>
        <p>You have been assigned to the selected property.</p>
      </div>
    );
  }

  return (
    <div className="tenant-assignment-container">
      <h2>Assign Property</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            required
          >
            <option value="">Choose a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address} - ${property.monthly_rent}/month
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Lease Start Date</label>
          <input
            type="date"
            value={leaseStart}
            onChange={(e) => setLeaseStart(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Lease End Date</label>
          <input
            type="date"
            value={leaseEnd}
            onChange={(e) => setLeaseEnd(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading || !selectedProperty}>
          {loading ? 'Assigning...' : 'Assign Property'}
        </button>
      </form>
    </div>
  );
};

export default TenantPropertyAssignment;
