import React, { useState } from 'react';
import { Mountain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import HikesList from '../components/hikes/HikesList';
import PageHeader from '../components/common/PageHeader';

const HikesPage = () => {
  const { currentUser } = useAuth();
  const [showAddHike, setShowAddHike] = useState(false);

  return (
    <div>
      <PageHeader
        icon={Mountain}
        title="Hikes"
        subtitle="Browse and express interest in upcoming hiking adventures"
        action={
          currentUser.role === 'admin' && (
            <button
              className="btn text-white"
              style={{
                background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)',
                boxShadow: '0 2px 8px rgba(74, 124, 124, 0.3)'
              }}
              onClick={() => setShowAddHike(true)}
            >
              Add Hike
            </button>
          )
        }
      />

      <HikesList />

      {/* TODO: Integrate AddHikeForm modal when created */}
      {showAddHike && (
        <div className="alert alert-info">
          AddHikeForm component not yet created. Check REFACTORING_GUIDE.md for details.
          <button className="btn-close float-end" onClick={() => setShowAddHike(false)}></button>
        </div>
      )}
    </div>
  );
};

export default HikesPage;
