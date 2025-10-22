import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HikesCalendar from '../components/hikes/HikesCalendar';
import HikeDetailsModal from '../components/hikes/HikeDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';

// PERFORMANCE OPTIMIZATION: Smart refetching pattern
const CalendarPage = () => {
  const { token } = useAuth();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHike, setSelectedHike] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchHikes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHikes(token);
      setHikes(data);
    } catch (err) {
      console.error('Fetch hikes error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHikes();
  }, [fetchHikes]);

  const handleHikeClick = (hike) => {
    setSelectedHike(hike);
    setShowDetailsModal(true);
  };

  const handleDateClick = (date, dayHikes) => {
    if (dayHikes.length === 1) {
      handleHikeClick(dayHikes[0]);
    } else {
      // Could show a list modal here if multiple hikes on same day
      console.log('Multiple hikes on this date:', dayHikes);
    }
  };

  // PERFORMANCE OPTIMIZATION: Only refetch if data was modified
  // Prevents unnecessary API call on every modal close
  const handleModalClose = useCallback((dataModified = false) => {
    setShowDetailsModal(false);
    setSelectedHike(null);

    // Only refetch if user actually changed something
    if (dataModified) {
      fetchHikes();
    }
  }, [fetchHikes]);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading calendar..." />;
  }

  return (
    <>
      <PageHeader
        icon={CalendarIcon}
        title="Events Calendar"
        subtitle="View all events in calendar format"
      />

      <HikesCalendar
        hikes={hikes}
        onHikeClick={handleHikeClick}
        onDateClick={handleDateClick}
      />

      {showDetailsModal && selectedHike && (
        <HikeDetailsModal
          hike={selectedHike}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default CalendarPage;
