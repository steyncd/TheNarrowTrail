import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import useFavorites from '../hooks/useFavorites';
import HikeCard from '../components/hikes/HikeCard';
import HikeDetailsModal from '../components/hikes/HikeDetailsModal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';

const FavoritesPage = () => {
  const { token, currentUser } = useAuth();
  const { favorites } = useFavorites();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHike, setSelectedHike] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchHikes();
  }, []);

  const fetchHikes = async () => {
    setLoading(true);
    try {
      const data = await api.getHikes(token);
      setHikes(data);
    } catch (err) {
      console.error('Fetch hikes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (hike) => {
    setSelectedHike(hike);
    setShowDetailsModal(true);
  };

  const handleToggleInterest = async (hikeId) => {
    try {
      await api.toggleInterest(hikeId, token);
      await fetchHikes();
    } catch (err) {
      console.error('Toggle interest error:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading your favorites..." />;
  }

  // Filter hikes to only show favorites
  const favoriteHikes = hikes.filter(hike => favorites.includes(hike.id));

  if (favoriteHikes.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No Favorites Yet"
        message="Start adding hikes to your favorites by clicking the heart icon on any hike card."
        action={() => window.location.href = '/hikes'}
        actionLabel="Browse Hikes"
      />
    );
  }

  const now = new Date();
  const upcoming = favoriteHikes.filter(h => new Date(h.date) >= now);
  const past = favoriteHikes.filter(h => new Date(h.date) < now);

  return (
    <>
      <PageHeader
        icon={Heart}
        title="My Favorite Hikes"
        subtitle={`You have ${favoriteHikes.length} favorite hike${favoriteHikes.length !== 1 ? 's' : ''}`}
      />

      {upcoming.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-primary">Upcoming Favorites</h4>
          <div className="row g-4">
            {upcoming.map(hike => (
              <HikeCard
                key={hike.id}
                hike={hike}
                isPast={false}
                onViewDetails={handleViewDetails}
                onToggleInterest={handleToggleInterest}
                loading={false}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-muted">Past Favorites</h4>
          <div className="row g-4">
            {past.map(hike => (
              <HikeCard
                key={hike.id}
                hike={hike}
                isPast={true}
                onViewDetails={handleViewDetails}
                onToggleInterest={handleToggleInterest}
                loading={false}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </div>
      )}

      {showDetailsModal && selectedHike && (
        <HikeDetailsModal
          hike={selectedHike}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedHike(null);
            fetchHikes();
          }}
        />
      )}
    </>
  );
};

export default FavoritesPage;
