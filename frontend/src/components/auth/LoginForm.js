import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

const LoginForm = ({ onClose, onShowSignUp }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setEmail('');
      setPassword('');

      // Check for redirect parameter in URL
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect');

      if (redirectPath) {
        // Redirect to the specified path
        navigate(redirectPath);
      } else if (onClose) {
        // Default behavior - close the modal
        onClose();
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

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
            {onClose && (
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                style={{position: 'absolute', right: '15px', top: '15px'}}
              ></button>
            )}
          </div>

          <div className="modal-body p-4">
            <h4 className="text-center mb-4" style={{color: '#2d5a7c', fontWeight: '600'}}>Sign In</h4>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold mb-3"
                style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {onShowSignUp && (
                <div className="text-center mt-3">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0"
                      onClick={onShowSignUp}
                      disabled={loading}
                    >
                      Sign Up
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

export default LoginForm;
