import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SignUpForm = ({ onBack }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!consents.termsAccepted || !consents.privacyAccepted || !consents.dataProcessingAccepted) {
      setError('You must accept all consent requirements to register');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.phone,
      formData.password
    );

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        if (onBack) onBack();
      }, 5000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="modal-header border-0" style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}>
            <div className="w-100 text-center">
              <h5 className="modal-title text-white mb-2" style={{fontWeight: '700', letterSpacing: '1px'}}>
                THE NARROW TRAIL
              </h5>
              <p className="text-white-50 mb-0 small" style={{fontStyle: 'italic'}}>
                "Small is the gate and narrow the road that leads to life" - Matthew 7:14
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onBack}
                style={{position: 'absolute', right: '15px', top: '15px'}}
              ></button>
            )}
          </div>

          <div className="modal-body p-4">
            <h4 className="text-center mb-4" style={{color: '#2d5a7c', fontWeight: '600'}}>Sign Up</h4>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <small className="text-muted">At least 6 characters</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* POPIA Compliance Consents */}
              <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px solid #dee2e6' }}>
                <h6 className="mb-3" style={{ color: '#2d5a7c', fontWeight: '600' }}>
                  📋 Required Consents (POPIA Compliance)
                </h6>
                
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="termsCheck"
                    checked={consents.termsAccepted}
                    onChange={(e) => setConsents({...consents, termsAccepted: e.target.checked})}
                    disabled={loading}
                  />
                  <label className="form-check-label small" htmlFor="termsCheck">
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary">
                      Terms and Conditions
                    </a>
                    <span className="text-danger">*</span>
                  </label>
                </div>

                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="privacyCheck"
                    checked={consents.privacyAccepted}
                    onChange={(e) => setConsents({...consents, privacyAccepted: e.target.checked})}
                    disabled={loading}
                  />
                  <label className="form-check-label small" htmlFor="privacyCheck">
                    I have read and understand the{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary">
                      Privacy Policy
                    </a>
                    <span className="text-danger">*</span>
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dataCheck"
                    checked={consents.dataProcessingAccepted}
                    onChange={(e) => setConsents({...consents, dataProcessingAccepted: e.target.checked})}
                    disabled={loading}
                  />
                  <label className="form-check-label small" htmlFor="dataCheck">
                    I consent to the collection and processing of my personal information (name, email, phone) 
                    for the purpose of hiking club membership and communications, as outlined in the Privacy Policy
                    <span className="text-danger">*</span>
                  </label>
                </div>

                <div className="mt-2">
                  <small className="text-muted">
                    <strong>Why we need this:</strong> South African law (POPIA) requires your explicit consent 
                    before we can collect and process your personal information.
                  </small>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold mb-3"
                style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {onBack && (
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0"
                      onClick={onBack}
                      disabled={loading}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
