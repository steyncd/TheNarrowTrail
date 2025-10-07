import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CarpoolSection = ({ hikeId }) => {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerData, setOfferData] = useState({
    departure_location: '',
    available_seats: 1,
    departure_time: '',
    notes: ''
  });
  const [requestData, setRequestData] = useState({
    pickup_location: '',
    notes: ''
  });

  useEffect(() => {
    fetchCarpool();
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

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.submitCarpoolOffer(hikeId, offerData, token);
      if (result.success) {
        setOfferData({ departure_location: '', available_seats: 1, departure_time: '', notes: '' });
        setShowOfferForm(false);
        fetchCarpool();
      }
    } catch (err) {
      console.error('Submit offer error:', err);
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
        setRequestData({ pickup_location: '', notes: '' });
        setShowRequestForm(false);
        fetchCarpool();
      }
    } catch (err) {
      console.error('Submit request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-4">Carpool Coordination</h5>

      {/* Ride Offers */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Ride Offers</h6>
          <button
            className="btn btn-sm btn-success"
            onClick={() => setShowOfferForm(!showOfferForm)}
          >
            {showOfferForm ? 'Cancel' : 'Offer a Ride'}
          </button>
        </div>

        {showOfferForm && (
          <form onSubmit={handleSubmitOffer} className="card mb-3">
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Departure location"
                    value={offerData.departure_location}
                    onChange={(e) => setOfferData({...offerData, departure_location: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Seats"
                    min="1"
                    value={offerData.available_seats}
                    onChange={(e) => setOfferData({...offerData, available_seats: parseInt(e.target.value) || 1})}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="time"
                    className="form-control"
                    value={offerData.departure_time}
                    onChange={(e) => setOfferData({...offerData, departure_time: e.target.value})}
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Additional notes"
                    value={offerData.notes}
                    onChange={(e) => setOfferData({...offerData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-2">
                <button type="submit" className="btn btn-success btn-sm me-2" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Offer'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOfferForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {offers.length === 0 ? (
          <p className="text-muted small">No ride offers yet.</p>
        ) : (
          <div className="list-group mb-3">
            {offers.map(offer => (
              <div key={offer.id} className="list-group-item">
                <strong>{offer.driver_name}</strong>
                <p className="mb-1 small">
                  <MapPin size={14} className="me-1" />
                  From: {offer.departure_location}
                </p>
                <p className="mb-1 small">
                  <Users size={14} className="me-1" />
                  Available seats: {offer.available_seats}
                </p>
                {offer.departure_time && (
                  <p className="mb-1 small">
                    <Clock size={14} className="me-1" />
                    Departure: {offer.departure_time}
                  </p>
                )}
                {offer.notes && <p className="mb-0 small text-muted">{offer.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ride Requests */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Ride Requests</h6>
          <button
            className="btn btn-sm btn-info"
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            {showRequestForm ? 'Cancel' : 'Request a Ride'}
          </button>
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmitRequest} className="card mb-3">
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pickup location"
                    value={requestData.pickup_location}
                    onChange={(e) => setRequestData({...requestData, pickup_location: e.target.value})}
                    required
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Additional notes"
                    value={requestData.notes}
                    onChange={(e) => setRequestData({...requestData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-2">
                <button type="submit" className="btn btn-info btn-sm me-2" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRequestForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {requests.length === 0 ? (
          <p className="text-muted small">No ride requests yet.</p>
        ) : (
          <div className="list-group">
            {requests.map(request => (
              <div key={request.id} className="list-group-item">
                <strong>{request.requester_name}</strong>
                <p className="mb-1 small">
                  <MapPin size={14} className="me-1" />
                  Pickup location: {request.pickup_location}
                </p>
                {request.notes && <p className="mb-0 small text-muted">{request.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarpoolSection;
