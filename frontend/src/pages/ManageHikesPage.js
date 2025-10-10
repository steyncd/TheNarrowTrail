import React, { useState } from 'react';
import { Settings, DollarSign } from 'lucide-react';
import AdminPanel from '../components/admin/AdminPanel';
import PaymentsOverview from '../components/payments/PaymentsOverview';
import PageHeader from '../components/common/PageHeader';

const ManageHikesPage = () => {
  const [activeTab, setActiveTab] = useState('hikes');
  const [showAddHikeForm, setShowAddHikeForm] = useState(false);

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Manage Hikes"
        subtitle="Hike management and payment tracking"
        icon={Settings}
        action={
          activeTab === 'hikes' ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddHikeForm(true)}
            >
              Add Hike
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
                Hikes & Events
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
            <AdminPanel showAddHikeForm={showAddHikeForm} setShowAddHikeForm={setShowAddHikeForm} />
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div className="tab-pane fade show active">
            <PaymentsOverview />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHikesPage;