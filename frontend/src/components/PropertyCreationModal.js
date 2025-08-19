import React, { useState } from 'react';
import api from '../api';
import './PropertyCreationModal.css';

const PropertyCreationModal = ({ show, onClose, onPropertyCreated, isFirstLogin }) => {
    const [formData, setFormData] = useState({
        address: '',
        monthly_rent: '',
        is_vacant: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('http://127.0.0.1:8000/properties/create/', {
                address: formData.address,
                monthly_rent: parseFloat(formData.monthly_rent),
                is_vacant: formData.is_vacant
            });

            if (response.data.success) {
                onPropertyCreated(response.data.property);
                setFormData({ address: '', monthly_rent: '', is_vacant: false });
                onClose();
            } else {
                setError(response.data.error || 'Failed to create property');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isFirstLogin ? 'Create Your First Property' : 'Add New Property'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="property-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="address">Property Address *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter property address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="monthly_rent">Monthly Rent (KES) *</label>
                        <input
                            type="number"
                            id="monthly_rent"
                            name="monthly_rent"
                            value={formData.monthly_rent}
                            onChange={handleChange}
                            placeholder="Enter monthly rent"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_vacant"
                                checked={formData.is_vacant}
                                onChange={handleChange}
                            />
                            <span>Mark as vacant</span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyCreationModal;
