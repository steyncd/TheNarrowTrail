import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, Mail, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function EmergencyContactsModal({ show, onClose, hikeId, hikeName }) {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && hikeId) {
      fetchEmergencyContacts();
    }
  }, [show, hikeId]);

  const fetchEmergencyContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHikeEmergencyContacts(hikeId, token);
      setContacts(data || []);
    } catch (err) {
      console.error('Fetch emergency contacts error:', err);
      setError('Failed to load emergency contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    const text = contacts.map(c =>
      `${c.name}\nEmergency Contact: ${c.emergency_contact_name}\nPhone: ${c.emergency_contact_phone}\nEmail: ${c.email}\n\n`
    ).join('');

    navigator.clipboard.writeText(text).then(() => {
      alert('Emergency contacts copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1055}}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <AlertCircle size={20} className="me-2" />
              Emergency Contacts - {hikeName}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="alert alert-info">
                No emergency contacts available. Attendees need to add their emergency contact information in their profile settings.
              </div>
            ) : (
              <div>
                <div className="alert alert-warning mb-3">
                  <strong>Important:</strong> This information is confidential. Use only for emergency purposes.
                </div>

                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th><User size={16} className="me-1" />Attendee</th>
                        <th><User size={16} className="me-1" />Emergency Contact</th>
                        <th><Phone size={16} className="me-1" />Phone</th>
                        <th><Mail size={16} className="me-1" />Attendee Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, index) => (
                        <tr key={index}>
                          <td>{contact.name}</td>
                          <td>{contact.emergency_contact_name || <span className="text-muted">Not provided</span>}</td>
                          <td>
                            {contact.emergency_contact_phone ? (
                              <a href={`tel:${contact.emergency_contact_phone}`}>
                                {contact.emergency_contact_phone}
                              </a>
                            ) : (
                              <span className="text-muted">Not provided</span>
                            )}
                          </td>
                          <td>
                            <a href={`mailto:${contact.email}`}>
                              {contact.email}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-light mt-3">
                  <small className="text-muted">
                    Total Contacts: {contacts.length} |
                    Missing Info: {contacts.filter(c => !c.emergency_contact_name || !c.emergency_contact_phone).length}
                  </small>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyToClipboard}
              disabled={loading || contacts.length === 0}
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              disabled={loading || contacts.length === 0}
            >
              Print List
            </button>
            <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyContactsModal;
