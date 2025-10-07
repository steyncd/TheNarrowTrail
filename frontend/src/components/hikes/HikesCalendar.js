import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const HikesCalendar = ({ hikes, onDateClick, onHikeClick }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getHikesForDate = (date) => {
    return hikes.filter(hike => {
      const hikeDate = new Date(hike.date);
      return (
        hikeDate.getDate() === date.getDate() &&
        hikeDate.getMonth() === date.getMonth() &&
        hikeDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#28a745',
      moderate: '#ffc107',
      hard: '#fd7e14',
      expert: '#dc3545'
    };
    return colors[difficulty.toLowerCase()] || '#6c757d';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayHikes = getHikesForDate(date);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day}
          className="calendar-day"
          style={{
            background: isCurrentDay
              ? theme === 'dark' ? '#4a7c7c' : '#e3f2fd'
              : theme === 'dark' ? 'var(--bg-secondary)' : 'white',
            border: isCurrentDay ? '2px solid #2d5a7c' : `1px solid ${theme === 'dark' ? 'var(--border-color)' : '#dee2e6'}`,
            borderRadius: '8px',
            padding: 'clamp(4px, 1vw, 8px)',
            minHeight: 'clamp(60px, 15vw, 100px)',
            cursor: dayHikes.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={() => dayHikes.length > 0 && onDateClick && onDateClick(date, dayHikes)}
        >
          <div
            className="fw-bold mb-1"
            style={{
              color: isCurrentDay
                ? theme === 'dark' ? 'white' : '#2d5a7c'
                : theme === 'dark' ? 'var(--text-primary)' : '#212529',
              fontSize: 'clamp(0.75rem, 2vw, 1rem)',
              flexShrink: 0
            }}
          >
            {day}
          </div>
          {dayHikes.length > 0 && (
            <div className="d-flex flex-column gap-1" style={{ overflow: 'hidden', flex: 1 }}>
              {dayHikes.slice(0, 3).map((hike, index) => (
                <div
                  key={hike.id}
                  className="small p-1 rounded"
                  style={{
                    background: getDifficultyColor(hike.difficulty),
                    color: 'white',
                    fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    minHeight: '0',
                    lineHeight: '1.2'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHikeClick && onHikeClick(hike);
                  }}
                  title={hike.name}
                >
                  {hike.name}
                </div>
              ))}
              {dayHikes.length > 3 && (
                <div
                  className="small text-center"
                  style={{
                    fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)',
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d',
                    fontWeight: 'bold'
                  }}
                >
                  +{dayHikes.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div
      className="calendar-container"
      style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
        borderRadius: '12px',
        padding: 'clamp(10px, 3vw, 20px)',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Calendar Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3
          style={{
            margin: 0,
            color: theme === 'dark' ? 'var(--text-primary)' : '#212529'
          }}
        >
          {monthNames[month]} {year}
        </h3>
        <div className="d-flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="btn btn-outline-primary btn-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="btn btn-primary btn-sm"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="btn btn-outline-primary btn-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '4px',
          marginBottom: '8px'
        }}
      >
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center fw-bold"
            style={{
              color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d',
              fontSize: 'clamp(0.65rem, 2vw, 0.875rem)',
              overflow: 'hidden'
            }}
          >
            <span className="d-none d-md-inline">{day}</span>
            <span className="d-md-none">{day.substring(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '4px',
          overflow: 'hidden'
        }}
      >
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${theme === 'dark' ? 'var(--border-color)' : '#dee2e6'}` }}>
        <div className="small fw-bold mb-2" style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}>
          Difficulty Legend:
        </div>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge" style={{ background: getDifficultyColor('easy') }}>Easy</span>
          <span className="badge" style={{ background: getDifficultyColor('moderate') }}>Moderate</span>
          <span className="badge" style={{ background: getDifficultyColor('hard') }}>Hard</span>
          <span className="badge" style={{ background: getDifficultyColor('expert') }}>Expert</span>
        </div>
      </div>
    </div>
  );
};

export default HikesCalendar;
