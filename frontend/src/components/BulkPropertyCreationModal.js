import React, { useState } from 'react';
import api from '../api';
import './PropertyCreationModal.css';

const BulkPropertyCreationModal = ({ show, onClose, onPropertiesCreated }) => {
    const [properties, setProperties] = useState([{
        address: '',
        monthly_rent: '',
        is_vacant: false
    }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePropertyChange = (index, field, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index] = {
            ...updatedProperties[index],
            [field]: field === 'is_vacant' ? value : value
        };
        setProperties(updatedProperties);
    };

    const addProperty = () => {
        setProperties([...properties, {
            address: '',
            monthly_rent: '',
            is_vacant: false
        }]);
    };

    const removeProperty = (index) => {
        if (properties.length > 1) {
            const updatedProperties = properties.filter((_, i) => i !== index);
            setProperties(updatedProperties);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate all properties
            const validProperties = properties.filter(p => 
                p.address.trim() && p.monthly_rent && parseFloat(p.monthly_rent) > 0
            );

            if (validProperties.length === 0) {
                setError('Please add at least one valid property');
                return;
            }

            const response = await api.post('http://127.0.0.1:8000/properties/bulk-create/', {
                properties: validProperties.map(p => ({
                    address: p.address,
                    monthly_rent: parseFloat(p.monthly_rent),
                    is_vacant: p.is_vacant
                }))
            });

            if (response.data.success) {
                onPropertiesCreated(response.data.created_properties);
                setProperties([{ address: '', monthly_rent: '', is_vacant: false }]);
                onClose();
            } else {
                setError(response.data.error || 'Failed to create properties');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create properties');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content bulk-modal">
                <div className="modal-header">
                    <h2>Add Multiple Properties</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="property-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="properties-list">
                        {properties.map((property, index) => (
                            <div key={index} className="property-entry">
                                <h3>Property {index + 1}</h3>
                                
                                <div className="form-group">
                                    <label>Property Address *</label>
                                    <input
                                        type="text"
                                        value={property.address}
                                        onChange={(e) => handlePropertyChange(index, 'address', e.target.value)}
                                        placeholder="Enter property address"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Monthly Rent (KES) *</label>
                                    <input
                                        type="number"
                                        value={property.monthly_rent}
                                        onChange={(e) => handlePropertyChange(index, 'monthly_rent', e.target.value)}
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
                                            checked={property.is_vacant}
                                            onChange={(e) => handlePropertyChange(index, 'is_vacant', e.target.checked)}
                                        />
                                        <span>Mark as vacant</span>
                                    </label>
                                </div>

                                {properties.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-property-btn"
                                        onClick={() => removeProperty(index)}
                                    >
                                        Remove Property
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="add-more-btn" onClick={addProperty}>
                            Add Another Property
                        </button>
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating...' : `Create ${properties.length} Properties`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkPropertyCreationModal;
