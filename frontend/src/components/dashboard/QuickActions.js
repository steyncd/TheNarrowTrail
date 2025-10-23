import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Calendar,
  Package,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const QuickActions = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickActions();
  }, [token]);

  const fetchQuickActions = async () => {
    try {
      setLoading(true);
      const myHikes = await api.getMyHikes(token);
      const actionItems = [];

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check interested events that need confirmation
      if (myHikes.interested && myHikes.interested.length > 0) {
        const upcomingInterested = myHikes.interested.filter(hike => {
          const hikeDate = new Date(hike.date);
          return hikeDate >= today;
        });

        if (upcomingInterested.length > 0) {
          actionItems.push({
            id: 'confirm-attendance',
            type: 'action',
            priority: 'high',
            icon: CheckCircle,
            iconColor: 'success',
            title: `Confirm ${upcomingInterested.length} Event${upcomingInterested.length > 1 ? 's' : ''}`,
            description: `You've expressed interest in ${upcomingInterested.length} upcoming event${upcomingInterested.length > 1 ? 's' : ''}. Confirm your attendance!`,
            action: () => {
              navigate('/my-hikes#interested-events');
              setTimeout(() => {
                const element = document.getElementById('interested-events');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            },
            actionText: 'View Events',
            count: upcomingInterested.length
          });
        }
      }

      // Check registration deadlines approaching
      if (myHikes.confirmed && myHikes.confirmed.length > 0) {
        const deadlinesApproaching = myHikes.confirmed.filter(hike => {
          if (!hike.registration_deadline) return false;

          const deadline = new Date(hike.registration_deadline);
          const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          return daysUntil > 0 && daysUntil <= 7;
        });

        if (deadlinesApproaching.length > 0) {
          actionItems.push({
            id: 'registration-deadline',
            type: 'alert',
            priority: 'urgent',
            icon: Clock,
            iconColor: 'warning',
            title: 'Registration Deadline Soon',
            description: `${deadlinesApproaching.length} event${deadlinesApproaching.length > 1 ? 's have' : ' has'} registration deadlines within 7 days`,
            action: () => {
              navigate('/my-hikes#confirmed-events');
              setTimeout(() => {
                const element = document.getElementById('confirmed-events');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            },
            actionText: 'Check Deadlines',
            count: deadlinesApproaching.length
          });
        }
      }

      // Check payments due
      if (myHikes.confirmed && myHikes.confirmed.length > 0) {
        const paymentsDue = myHikes.confirmed.filter(hike => {
          if (!hike.payment_deadline) return false;

          const deadline = new Date(hike.payment_deadline);
          const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          return daysUntil > 0 && daysUntil <= 7 && hike.cost > 0;
        });

        if (paymentsDue.length > 0) {
          actionItems.push({
            id: 'payment-due',
            type: 'alert',
            priority: 'high',
            icon: DollarSign,
            iconColor: 'danger',
            title: 'Payment Due Soon',
            description: `${paymentsDue.length} event${paymentsDue.length > 1 ? 's require' : ' requires'} payment within 7 days`,
            action: () => {
              navigate('/my-hikes#confirmed-events');
              setTimeout(() => {
                const element = document.getElementById('confirmed-events');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            },
            actionText: 'Make Payment',
            count: paymentsDue.length
          });
        }
      }

      // Check upcoming events this week
      if (myHikes.confirmed && myHikes.confirmed.length > 0) {
        const upcomingThisWeek = myHikes.confirmed.filter(hike => {
          const hikeDate = new Date(hike.date);
          const daysUntil = Math.ceil((hikeDate - today) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7;
        });

        if (upcomingThisWeek.length > 0) {
          actionItems.push({
            id: 'upcoming-week',
            type: 'info',
            priority: 'medium',
            icon: Calendar,
            iconColor: 'primary',
            title: `${upcomingThisWeek.length} Event${upcomingThisWeek.length > 1 ? 's' : ''} This Week`,
            description: 'Review event details and prepare for your adventures',
            action: () => navigate('/calendar'),
            actionText: 'View Calendar',
            count: upcomingThisWeek.length
          });
        }
      }

      // Check incomplete packing lists (if user has confirmed events)
      if (myHikes.confirmed && myHikes.confirmed.length > 0) {
        const needsPacking = myHikes.confirmed.filter(hike => {
          const hikeDate = new Date(hike.date);
          const daysUntil = Math.ceil((hikeDate - today) / (1000 * 60 * 60 * 24));
          return daysUntil > 0 && daysUntil <= 14; // Events within 2 weeks
        });

        if (needsPacking.length > 0) {
          actionItems.push({
            id: 'packing-list',
            type: 'info',
            priority: 'low',
            icon: Package,
            iconColor: 'info',
            title: 'Prepare Your Gear',
            description: `Review packing lists for ${needsPacking.length} upcoming event${needsPacking.length > 1 ? 's' : ''}`,
            action: () => {
              navigate('/my-hikes#confirmed-events');
              setTimeout(() => {
                const element = document.getElementById('confirmed-events');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            },
            actionText: 'View Lists',
            count: needsPacking.length
          });
        }
      }

      // Calculate stats
      const totalUpcoming = (myHikes.confirmed || []).filter(h => new Date(h.date) >= today).length;
      const totalInterested = (myHikes.interested || []).length;
      const totalAttended = (myHikes.attended || []).length;
      const completionRate = totalAttended + totalUpcoming > 0
        ? Math.round((totalAttended / (totalAttended + totalUpcoming)) * 100)
        : 0;

      setStats({
        confirmed: totalUpcoming,
        interested: totalInterested,
        attended: totalAttended,
        completionRate
      });

      // Sort actions by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setActions(actionItems);
    } catch (error) {
      console.error('Error fetching quick actions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-actions">
      {/* Stats Overview */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card text-center" style={{
              background: theme === 'dark' ? 'var(--card-bg)' : 'white',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}>
              <div className="card-body py-3">
                <div className="text-primary fw-bold" style={{ fontSize: '1.5rem' }}>
                  {stats.confirmed}
                </div>
                <div className="small text-muted">Confirmed</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center" style={{
              background: theme === 'dark' ? 'var(--card-bg)' : 'white',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}>
              <div className="card-body py-3">
                <div className="text-info fw-bold" style={{ fontSize: '1.5rem' }}>
                  {stats.interested}
                </div>
                <div className="small text-muted">Interested</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center" style={{
              background: theme === 'dark' ? 'var(--card-bg)' : 'white',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}>
              <div className="card-body py-3">
                <div className="text-success fw-bold" style={{ fontSize: '1.5rem' }}>
                  {stats.attended}
                </div>
                <div className="small text-muted">Completed</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center" style={{
              background: theme === 'dark' ? 'var(--card-bg)' : 'white',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}>
              <div className="card-body py-3">
                <div className="text-warning fw-bold" style={{ fontSize: '1.5rem' }}>
                  {stats.completionRate}%
                </div>
                <div className="small text-muted">Completion</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      {actions.length > 0 ? (
        <div className="row g-3">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="col-12 col-md-6">
                <div
                  className="card h-100"
                  style={{
                    background: theme === 'dark' ? 'var(--card-bg)' : 'white',
                    border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={action.action}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className={`d-flex align-items-center justify-content-center rounded-circle bg-${action.iconColor} bg-opacity-10`}
                        style={{ width: '48px', height: '48px', flexShrink: 0 }}
                      >
                        <Icon size={24} className={`text-${action.iconColor}`} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="mb-0">{action.title}</h6>
                          {action.count > 0 && (
                            <span className={`badge bg-${action.iconColor}`}>
                              {action.count}
                            </span>
                          )}
                        </div>
                        <p className="text-muted small mb-2">{action.description}</p>
                        <button
                          className={`btn btn-sm btn-outline-${action.iconColor}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.action();
                          }}
                        >
                          {action.actionText} <ArrowRight size={14} className="ms-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}>
          <div className="card-body text-center py-5">
            <TrendingUp size={48} className="text-muted mb-3" />
            <h5>All Caught Up!</h5>
            <p className="text-muted mb-3">You have no pending actions at the moment.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/hikes')}
            >
              Browse Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
