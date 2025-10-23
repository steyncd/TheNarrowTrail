import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Users, Clock, DollarSign, Phone, Mail, Navigation, TrendingUp, Car, Fuel, Calculator, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './CarpoolSectionEnhanced.css';

/**
 * Enhanced Carpool/Lift Club Section
 *
 * New Features:
 * - Contact information (phone/email) for direct communication
 * - Fuel cost calculator
 * - Smart matching suggestions
 * - Visual improvements with avatars
 * - Confirmed passengers tracking
 * - Distance/route information
 * - Cost per passenger calculation
 */
const CarpoolSectionEnhanced = ({ hikeId, hikeLocation }) => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerData, setOfferData] = useState({
    departure_location: '',
    available_seats: 3,
    departure_time: '',
    estimated_distance_km: '',
    fuel_cost_per_liter: 23.50,
    vehicle_consumption: 8.0,
    notes: '',
    contact_phone: currentUser?.phone || '',
    contact_email: currentUser?.email || ''
  });
  const [requestData, setRequestData] = useState({
    pickup_location: '',
    notes: '',
    contact_phone: currentUser?.phone || '',
    contact_email: currentUser?.email || ''
  });

  // Calculator state
  const [calculatorData, setCalculatorData] = useState({
    distance: 100,
    fuelPrice: 23.50,
    consumption: 8.0,
    passengers: 3,
    includeTolls: false,
    tollFees: 0
  });

  useEffect(() => {
    fetchCarpool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hikeId]);

  const fetchCarpool = async () => {
    try {
      const [offersData, requestsData] = await Promise.all([
        api.getCarpoolOffers(hikeId, token),
        api.getCarpoolRequests(hikeId, token)
      ]);
      setOffers(offersData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Fetch carpool error:', err);
    }
  };

  // Calculate fuel cost
  const calculateFuelCost = (distance, fuelPrice, consumption, passengers = 1, tollFees = 0) => {
    const fuelCost = (distance / 100) * consumption * fuelPrice;
    const totalCost = fuelCost + tollFees;
    const costPerPerson = totalCost / (passengers + 1); // +1 for driver
    return {
      totalFuel: fuelCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      costPerPerson: costPerPerson.toFixed(2)
    };
  };

  // Estimated cost for the offer
  const offerCostEstimate = useMemo(() => {
    if (offerData.estimated_distance_km && offerData.fuel_cost_per_liter && offerData.vehicle_consumption) {
      return calculateFuelCost(
        parseFloat(offerData.estimated_distance_km),
        parseFloat(offerData.fuel_cost_per_liter),
        parseFloat(offerData.vehicle_consumption),
        parseInt(offerData.available_seats)
      );
    }
    return null;
  }, [offerData.estimated_distance_km, offerData.fuel_cost_per_liter, offerData.vehicle_consumption, offerData.available_seats]);

  // Calculator cost
  const calculatorCost = useMemo(() => {
    return calculateFuelCost(
      calculatorData.distance,
      calculatorData.fuelPrice,
      calculatorData.consumption,
      calculatorData.passengers,
      calculatorData.includeTolls ? calculatorData.tollFees : 0
    );
  }, [calculatorData]);

  // Smart matching - find compatible offers for a given pickup location
  const getMatchedOffers = (pickupLocation) => {
    return offers.filter(offer => {
      // Simple matching logic - can be enhanced with geocoding
      const offerLower = offer.departure_location.toLowerCase();
      const pickupLower = pickupLocation.toLowerCase();
      return offerLower.includes(pickupLower) || pickupLower.includes(offerLower);
    });
  };

  const handleEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setOfferData({
      departure_location: offer.departure_location || '',
      available_seats: offer.available_seats || 3,
      departure_time: offer.departure_time || '',
      estimated_distance_km: offer.estimated_distance_km || '',
      fuel_cost_per_liter: offer.fuel_cost_per_liter || 23.50,
      vehicle_consumption: offer.vehicle_consumption || 8.0,
      notes: offer.notes || '',
      contact_phone: offer.contact_phone || currentUser?.phone || '',
      contact_email: offer.contact_email || currentUser?.email || ''
    });
    setShowOfferForm(true);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (editingOfferId) {
        // Update existing offer
        result = await api.updateCarpoolOffer(hikeId, editingOfferId, offerData, token);
      } else {
        // Create new offer
        result = await api.submitCarpoolOffer(hikeId, offerData, token);
      }

      if (result.success) {
        setOfferData({
          departure_location: '',
          available_seats: 3,
          departure_time: '',
          estimated_distance_km: '',
          fuel_cost_per_liter: 23.50,
          vehicle_consumption: 8.0,
          notes: '',
          contact_phone: currentUser?.phone || '',
          contact_email: currentUser?.email || ''
        });
        setEditingOfferId(null);
        setShowOfferForm(false);
        fetchCarpool();
      }
    } catch (err) {
      console.error('Submit offer error:', err);
      alert(`Failed to ${editingOfferId ? 'update' : 'create'} offer`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.submitCarpoolRequest(hikeId, requestData, token);
      if (result.success) {
        setRequestData({
          pickup_location: '',
          notes: '',
          contact_phone: currentUser?.phone || '',
          contact_email: currentUser?.email || ''
        });
        setShowRequestForm(false);
        fetchCarpool();
      }
    } catch (err) {
      console.error('Submit request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this carpool offer?')) {
      return;
    }
    try {
      const result = await api.deleteCarpoolOffer(hikeId, offerId, token);
      if (result.success) {
        fetchCarpool();
      }
    } catch (err) {
      console.error('Delete offer error:', err);
      alert('Failed to delete offer');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this carpool request?')) {
      return;
    }
    try {
      const result = await api.deleteCarpoolRequest(hikeId, requestId, token);
      if (result.success) {
        fetchCarpool();
      }
    } catch (err) {
      console.error('Delete request error:', err);
      alert('Failed to delete request');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
      <div className="card-body">
        <div className="carpool-section-enhanced" data-theme={theme}>
          <div className="carpool-header">
            <h5 className="mb-1 d-flex align-items-center">
              <Car size={20} className="me-2" />
              Lift Club / Carpool
            </h5>
            <p className="text-muted small mb-3">Share rides and reduce costs</p>
          </div>

      {/* Fuel Cost Calculator */}
      <div className="calculator-section mb-4">
        <button
          className="btn btn-outline-primary btn-sm w-100"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <Calculator size={16} className="me-2" />
          {showCalculator ? 'Hide' : 'Show'} Fuel Cost Calculator
        </button>

        {showCalculator && (
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="mb-3">Estimate Trip Costs</h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">Distance (km)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={calculatorData.distance}
                    onChange={(e) => setCalculatorData({...calculatorData, distance: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Fuel Price (R/L)</label>
                  <input
                    type="number"
                    step="0.10"
                    className="form-control form-control-sm"
                    value={calculatorData.fuelPrice}
                    onChange={(e) => setCalculatorData({...calculatorData, fuelPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Consumption (L/100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={calculatorData.consumption}
                    onChange={(e) => setCalculatorData({...calculatorData, consumption: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Passengers</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={calculatorData.passengers}
                    onChange={(e) => setCalculatorData({...calculatorData, passengers: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="includeTolls"
                      checked={calculatorData.includeTolls}
                      onChange={(e) => setCalculatorData({...calculatorData, includeTolls: e.target.checked})}
                    />
                    <label className="form-check-label small" htmlFor="includeTolls">
                      Include toll fees
                    </label>
                  </div>
                  {calculatorData.includeTolls && (
                    <input
                      type="number"
                      className="form-control form-control-sm mt-2"
                      placeholder="Toll fees (R)"
                      value={calculatorData.tollFees}
                      onChange={(e) => setCalculatorData({...calculatorData, tollFees: parseFloat(e.target.value) || 0})}
                    />
                  )}
                </div>
              </div>

              {/* Calculator Results */}
              <div className="calculator-results mt-3">
                <div className="result-row">
                  <span className="result-label">
                    <Fuel size={14} />
                    Fuel Cost:
                  </span>
                  <span className="result-value">R {calculatorCost.totalFuel}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">
                    <DollarSign size={14} />
                    Total Cost:
                  </span>
                  <span className="result-value">R {calculatorCost.totalCost}</span>
                </div>
                <div className="result-row highlight">
                  <span className="result-label">
                    <Users size={14} />
                    Cost per Person:
                  </span>
                  <span className="result-value">R {calculatorCost.costPerPerson}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ride Offers */}
      <div className="carpool-subsection mb-4">
        <div className="subsection-header">
          <h6 className="mb-0">
            <Car size={18} className="me-2" />
            Offering Rides ({offers.length})
          </h6>
          <button
            className="btn btn-sm btn-success"
            onClick={() => setShowOfferForm(!showOfferForm)}
          >
            {showOfferForm ? 'Cancel' : 'Offer a Ride'}
          </button>
        </div>

        {showOfferForm && (
          <form onSubmit={handleSubmitOffer} className="carpool-form">
            <div className="form-section">
              <h6 className="form-section-title">Trip Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Departure Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Johannesburg CBD"
                    value={offerData.departure_location}
                    onChange={(e) => setOfferData({...offerData, departure_location: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Available Seats *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="7"
                    value={offerData.available_seats}
                    onChange={(e) => setOfferData({...offerData, available_seats: parseInt(e.target.value) || 1})}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Departure Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={offerData.departure_time}
                    onChange={(e) => setOfferData({...offerData, departure_time: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h6 className="form-section-title">Cost Sharing (Optional)</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Distance (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                    value={offerData.estimated_distance_km}
                    onChange={(e) => setOfferData({...offerData, estimated_distance_km: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fuel Price (R/L)</label>
                  <input
                    type="number"
                    step="0.10"
                    className="form-control"
                    value={offerData.fuel_cost_per_liter}
                    onChange={(e) => setOfferData({...offerData, fuel_cost_per_liter: parseFloat(e.target.value) || 23.50})}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Consumption (L/100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={offerData.vehicle_consumption}
                    onChange={(e) => setOfferData({...offerData, vehicle_consumption: parseFloat(e.target.value) || 8.0})}
                  />
                </div>
              </div>

              {offerCostEstimate && (
                <div className="cost-estimate mt-2">
                  <small className="text-success">
                    <DollarSign size={14} />
                    Estimated cost per passenger: <strong>R {offerCostEstimate.costPerPerson}</strong>
                  </small>
                </div>
              )}
            </div>

            <div className="form-section">
              <h6 className="form-section-title">Contact Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="082 123 4567"
                    value={offerData.contact_phone}
                    onChange={(e) => setOfferData({...offerData, contact_phone: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={offerData.contact_email}
                    onChange={(e) => setOfferData({...offerData, contact_email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Meeting point, car description, preferences, etc."
                value={offerData.notes}
                onChange={(e) => setOfferData({...offerData, notes: e.target.value})}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (editingOfferId ? 'Updating...' : 'Submitting...') : (editingOfferId ? 'Update Offer' : 'Submit Offer')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowOfferForm(false);
                setEditingOfferId(null);
                setOfferData({
                  departure_location: '',
                  available_seats: 3,
                  departure_time: '',
                  estimated_distance_km: '',
                  fuel_cost_per_liter: 23.50,
                  vehicle_consumption: 8.0,
                  notes: '',
                  contact_phone: currentUser?.phone || '',
                  contact_email: currentUser?.email || ''
                });
              }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Offer Cards */}
        {offers.length === 0 ? (
          <p className="text-muted small text-center py-3">No ride offers yet. Be the first to offer!</p>
        ) : (
          <div className="carpool-cards">
            {offers.map(offer => (
              <div key={offer.id} className="carpool-card offer-card">
                <div className="card-header-row">
                  <div className="driver-info">
                    <div className="driver-avatar">
                      {offer.driver_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{offer.driver_name}</strong>
                      <div className="text-muted small">Driver</div>
                    </div>
                  </div>
                  <div className="seats-badge">
                    <Users size={16} />
                    {offer.available_seats} {offer.available_seats === 1 ? 'seat' : 'seats'}
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>From: {offer.departure_location}</span>
                  </div>
                  {offer.departure_time && (
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>Departs: {offer.departure_time}</span>
                    </div>
                  )}
                  {offer.estimated_cost_per_person && (
                    <div className="detail-item highlight">
                      <DollarSign size={14} />
                      <span>~R {offer.estimated_cost_per_person} per person</span>
                    </div>
                  )}
                </div>

                {offer.notes && (
                  <div className="card-notes">
                    {offer.notes}
                  </div>
                )}

                {/* Contact Info */}
                {(offer.contact_phone || offer.contact_email) && (
                  <div className="card-contact">
                    {offer.contact_phone && (
                      <a href={`tel:${offer.contact_phone}`} className="contact-link">
                        <Phone size={14} />
                        {offer.contact_phone}
                      </a>
                    )}
                    {offer.contact_email && (
                      <a href={`mailto:${offer.contact_email}`} className="contact-link">
                        <Mail size={14} />
                        {offer.contact_email}
                      </a>
                    )}
                  </div>
                )}

                {/* Edit and Delete buttons for own offers */}
                {currentUser && offer.user_id === currentUser.id && (
                  <div className="card-actions mt-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleEditOffer(offer)}
                    >
                      <Edit2 size={14} className="me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDeleteOffer(offer.id)}
                    >
                      <Trash2 size={14} className="me-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ride Requests */}
      <div className="carpool-subsection">
        <div className="subsection-header">
          <h6 className="mb-0">
            <Navigation size={18} className="me-2" />
            Looking for Rides ({requests.length})
          </h6>
          <button
            className="btn btn-sm btn-info"
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            {showRequestForm ? 'Cancel' : 'Request a Ride'}
          </button>
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmitRequest} className="carpool-form">
            <div className="form-section">
              <label className="form-label">Pickup Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Where would you like to be picked up?"
                value={requestData.pickup_location}
                onChange={(e) => setRequestData({...requestData, pickup_location: e.target.value})}
                required
              />
            </div>

            <div className="form-section">
              <h6 className="form-section-title">Contact Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="082 123 4567"
                    value={requestData.contact_phone}
                    onChange={(e) => setRequestData({...requestData, contact_phone: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={requestData.contact_email}
                    onChange={(e) => setRequestData({...requestData, contact_email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Flexible on pickup location, can contribute to fuel costs, etc."
                value={requestData.notes}
                onChange={(e) => setRequestData({...requestData, notes: e.target.value})}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-info" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRequestForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Request Cards */}
        {requests.length === 0 ? (
          <p className="text-muted small text-center py-3">No ride requests yet.</p>
        ) : (
          <div className="carpool-cards">
            {requests.map(request => {
              const matchedOffers = getMatchedOffers(request.pickup_location);

              return (
                <div key={request.id} className="carpool-card request-card">
                  <div className="card-header-row">
                    <div className="driver-info">
                      <div className="driver-avatar">
                        {request.requester_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{request.requester_name}</strong>
                        <div className="text-muted small">Looking for ride</div>
                      </div>
                    </div>
                    {matchedOffers.length > 0 && (
                      <div className="match-badge">
                        <TrendingUp size={14} />
                        {matchedOffers.length} {matchedOffers.length === 1 ? 'match' : 'matches'}
                      </div>
                    )}
                  </div>

                  <div className="card-details">
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>Pickup: {request.pickup_location}</span>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="card-notes">
                      {request.notes}
                    </div>
                  )}

                  {/* Contact Info */}
                  {(request.contact_phone || request.contact_email) && (
                    <div className="card-contact">
                      {request.contact_phone && (
                        <a href={`tel:${request.contact_phone}`} className="contact-link">
                          <Phone size={14} />
                          {request.contact_phone}
                        </a>
                      )}
                      {request.contact_email && (
                        <a href={`mailto:${request.contact_email}`} className="contact-link">
                          <Mail size={14} />
                          {request.contact_email}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Show matched offers */}
                  {matchedOffers.length > 0 && (
                    <div className="matched-offers">
                      <small className="text-success">Possible matches nearby</small>
                    </div>
                  )}

                  {/* Delete button for own requests */}
                  {currentUser && request.user_id === currentUser.id && (
                    <div className="card-actions mt-2">
                      <button
                        className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 size={14} className="me-1" />
                        Delete Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default CarpoolSectionEnhanced;
