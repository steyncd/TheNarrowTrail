import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

function DataExport() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${api.baseURL}/api/profile/export/data`, {
        headers: api.getAuthHeaders(token)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      const userData = await response.json();
      
      // Create a Blob with the JSON data
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Your data has been exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <Download size={20} className="me-2" />
          Export My Data
        </h5>
        <p className="text-muted">
          Download a complete copy of your personal data in JSON format. This includes your profile information, 
          hike participation history, emergency contacts, payments, photos, comments, and feedback.
        </p>
        
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

        <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center">
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="me-2 spinner-border spinner-border-sm" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} className="me-2" />
                Export Data
              </>
            )}
          </button>
          
          <small className="text-muted">
            You have the right to access and export your data under POPIA
          </small>
        </div>

        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <strong>What's included:</strong>
            <ul className="mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
              <li>Profile information (name, email, phone, preferences)</li>
              <li>Hike participation records and attendance</li>
              <li>Emergency contact details</li>
              <li>Payment history</li>
              <li>Photos you've uploaded</li>
              <li>Comments and feedback submitted</li>
              <li>Suggestions you've made</li>
            </ul>
          </small>
        </div>
      </div>
    </div>
  );
}

export default DataExport;
