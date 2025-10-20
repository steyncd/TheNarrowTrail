import React, { useState } from 'react';
import { Settings, DollarSign, Receipt, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/admin/AdminPanel';
import PaymentsOverview from '../components/payments/PaymentsOverview';
import ExpensesOverview from '../components/payments/ExpensesOverview';
import PageHeader from '../components/common/PageHeader';
import PermissionGate from '../components/PermissionGate';

const ManageHikesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hikes');
  const [activeFinanceTab, setActiveFinanceTab] = useState('payments');

  return (
    <PermissionGate 
      permission="hikes.edit"
      fallback={
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h5>Access Denied</h5>
            <p>You don't have permission to manage hikes.</p>
            <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
              Return to Hikes
            </button>
          </div>
        </div>
      }
    >
      <div className="container-fluid py-4">
        <PageHeader
          title="Manage Events"
          subtitle="Event management and payment tracking"
          icon={Settings}
          action={
            activeTab === 'hikes' ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/events/add')}
              >
                Add Event
              </button>
            ) : null
          }
        />
      
      {/* Tab Navigation */}
      <div className="card mb-4">
        <div className="card-header p-0">
          <ul className="nav nav-tabs nav-fill" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'hikes' ? 'active' : ''}`}
                onClick={() => setActiveTab('hikes')}
                type="button"
              >
                <Settings size={18} className="me-2" />
                Events
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
                type="button"
              >
                <DollarSign size={18} className="me-2" />
                Payments & Finance
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'hikes' && (
          <div className="tab-pane fade show active">
            <AdminPanel />
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div className="tab-pane fade show active">
            {/* Finance Sub-tabs */}
            <div className="card mb-3">
              <div className="card-header p-0">
                <ul className="nav nav-pills nav-fill" role="tablist">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeFinanceTab === 'payments' ? 'active' : ''}`}
                      onClick={() => setActiveFinanceTab('payments')}
                      type="button"
                    >
                      <CreditCard size={16} className="me-2" />
                      Payments
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeFinanceTab === 'expenses' ? 'active' : ''}`}
                      onClick={() => setActiveFinanceTab('expenses')}
                      type="button"
                    >
                      <Receipt size={16} className="me-2" />
                      Expenses
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Finance Tab Content */}
            {activeFinanceTab === 'payments' && <PaymentsOverview />}
            {activeFinanceTab === 'expenses' && <ExpensesOverview />}
          </div>
        )}
      </div>
      </div>
    </PermissionGate>
  );
};

export default ManageHikesPage;