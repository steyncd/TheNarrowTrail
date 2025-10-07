import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = ({ onBack }) => {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: email, 2: token + new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setSuccess(result.message);
      setStep(2);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await resetPassword(email, resetToken, newPassword);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
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
            <h5 className="modal-title text-white">Reset Password</h5>
            {onBack && (
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onBack}
              ></button>
            )}
          </div>

          <div className="modal-body p-4">
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

            {step === 1 ? (
              <form onSubmit={handleRequestReset}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                  <small className="text-muted">
                    We'll send you a reset code to this email
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white fw-semibold"
                  style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Reset Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter the code from your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white fw-semibold"
                  style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {onBack && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={onBack}
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
