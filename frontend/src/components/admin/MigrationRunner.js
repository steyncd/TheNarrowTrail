import React, { useState } from 'react';
import { Database, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

function MigrationRunner() {
  const [status, setStatus] = useState('ready'); // ready, running, success, error
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  const runDataRetentionMigration = async () => {
    if (currentUser?.role !== 'admin') {
      setStatus('error');
      setMessage('Admin access required');
      return;
    }

    setStatus('running');
    setMessage('Running data retention migration...');

    try {
      const response = await api.post('/admin/run-migration/016_add_data_retention_tracking.sql');
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || error.message);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="alert alert-warning">
        <AlertCircle size={20} className="me-2" />
        Admin access required
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <Database size={20} className="me-2" />
          Data Retention Migration
        </h5>
      </div>
      <div className="card-body">
        <p>
          This migration will add the necessary database fields and tables for automated POPIA data retention enforcement:
        </p>
        <ul>
          <li><strong>last_active_at</strong> - Track user activity for retention policies</li>
          <li><strong>retention_warning_sent_at</strong> - Track when 3-year warnings were sent</li>
          <li><strong>scheduled_deletion_at</strong> - Track when data is scheduled for deletion</li>
          <li><strong>data_retention_logs</strong> - Audit table for all retention activities</li>
        </ul>

        {status === 'ready' && (
          <button 
            className="btn btn-primary"
            onClick={runDataRetentionMigration}
          >
            <Play size={16} className="me-2" />
            Run Migration
          </button>
        )}

        {status === 'running' && (
          <div className="d-flex align-items-center text-info">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Running migration...
          </div>
        )}

        {status === 'success' && (
          <div className="alert alert-success">
            <CheckCircle size={20} className="me-2" />
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="alert alert-danger">
            <AlertCircle size={20} className="me-2" />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default MigrationRunner;