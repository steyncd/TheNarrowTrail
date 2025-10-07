import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HikesCalendar from '../components/hikes/HikesCalendar';
import HikeDetailsModal from '../components/hikes/HikeDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';

const CalendarPage = () => {
  const { token } = useAuth();
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

  if (loading) {
    return <LoadingSpinner size="large" message="Loading calendar..." />;
  }

  return (
    <>
      <PageHeader
        icon={CalendarIcon}
        title="Hikes Calendar"
        subtitle="View all hikes in calendar format"
      />

      <HikesCalendar
        hikes={hikes}
        onHikeClick={handleHikeClick}
        onDateClick={handleDateClick}
      />

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

export default CalendarPage;
