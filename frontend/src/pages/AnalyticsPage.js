import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import MetricCard from '../components/analytics/MetricCard';
import UserGrowthChart from '../components/analytics/UserGrowthChart';
import HikeDistributionCharts from '../components/analytics/HikeDistributionCharts';
import EngagementMetrics from '../components/analytics/EngagementMetrics';
import PageHeader from '../components/common/PageHeader';

const AnalyticsPage = () => {
  const { token } = useAuth();
  const { theme } = useTheme();

  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [hikeAnalytics, setHikeAnalytics] = useState(null);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewData, userData, hikeData, engagementData] = await Promise.all([
        api.getAnalyticsOverview(token),
        api.getUserAnalytics(token),
        api.getHikeAnalytics(token),
        api.getEngagementMetrics(token)
      ]);

      setOverview(overviewData);
      setUserAnalytics(userData);
      setHikeAnalytics(hikeData);
      setEngagementMetrics(engagementData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading analytics...</span>
          </div>
          <p className="mt-3">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5>Error Loading Analytics</h5>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchAnalyticsData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <PageHeader
        icon={BarChart3}
        title="Analytics Dashboard"
        subtitle="Overview of platform performance and user engagement"
      />

      {/* Overview Metrics */}
      {overview && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <MetricCard
              icon={Users}
              title="Total Users"
              value={overview.total_users}
              subtitle={`+${overview.new_users_30d} in last 30 days`}
              color="primary"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <MetricCard
              icon={Calendar}
              title="Upcoming Hikes"
              value={overview.upcoming_hikes}
              subtitle="Scheduled events"
              color="success"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <MetricCard
              icon={TrendingUp}
              title="Active Users"
              value={`${overview.active_users_30d}`}
              subtitle="Last 30 days"
              color="info"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <MetricCard
              icon={Target}
              title="Avg Attendance"
              value={hikeAnalytics?.average_attendance || 0}
              subtitle="Per hike"
              color="warning"
            />
          </div>
        </div>
      )}

      {/* User Growth Chart */}
      {userAnalytics && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card ${isDark ? 'bg-dark text-light' : ''}`}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center gap-2 mb-4">
                  <TrendingUp size={20} />
                  User Growth (Last 12 Months)
                </h5>
                <UserGrowthChart data={userAnalytics} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hike Distribution Charts */}
      {hikeAnalytics && (
        <div className="row mb-4">
          <div className="col-12">
            <HikeDistributionCharts data={hikeAnalytics} />
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <div className="row mb-4">
          <div className="col-12">
            <EngagementMetrics data={engagementMetrics} />
          </div>
        </div>
      )}

      {/* Top Participants */}
      {userAnalytics?.top_participants && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card ${isDark ? 'bg-dark text-light' : ''}`}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center gap-2 mb-4">
                  <Users size={20} />
                  Top Participants
                </h5>
                <div className="table-responsive">
                  <table className={`table ${isDark ? 'table-dark' : ''}`}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Confirmed Hikes</th>
                        <th>Activity Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAnalytics.top_participants.map((user, index) => (
                        <tr key={user.user_id}>
                          <td>{index + 1}</td>
                          <td>{user.full_name}</td>
                          <td>{user.confirmed_count}</td>
                          <td>
                            <span className={`badge ${
                              user.activity_level === 'highly_active' ? 'bg-success' :
                              user.activity_level === 'active' ? 'bg-primary' :
                              'bg-secondary'
                            }`}>
                              {user.activity_level.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
