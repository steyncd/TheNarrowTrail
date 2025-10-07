import React from 'react';
import { MessageSquare, Image, TrendingUp, UserCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const EngagementMetrics = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const metrics = [
    {
      icon: MessageSquare,
      title: 'Total Comments',
      value: data.total_comments || 0,
      subtitle: `${data.comments_per_hike || 0} per hike avg`,
      color: 'primary'
    },
    {
      icon: Image,
      title: 'Total Photos',
      value: data.total_photos || 0,
      subtitle: `${data.photos_per_hike || 0} per hike avg`,
      color: 'success'
    },
    {
      icon: TrendingUp,
      title: 'Conversion Rate',
      value: `${data.conversion_rate || 0}%`,
      subtitle: 'Interest to Confirmation',
      color: 'info'
    },
    {
      icon: UserCheck,
      title: 'Active Users',
      value: data.active_users || 0,
      subtitle: 'Last 30 days',
      color: 'warning'
    }
  ];

  return (
    <div className={`card ${isDark ? 'bg-dark text-light' : ''}`}>
      <div className="card-body">
        <h5 className="card-title mb-4">Engagement Metrics</h5>
        <div className="row g-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="d-flex align-items-start">
                  <div className={`p-2 rounded bg-${metric.color} bg-opacity-10 me-3`}>
                    <Icon size={24} className={`text-${metric.color}`} />
                  </div>
                  <div>
                    <h4 className="mb-1">{metric.value}</h4>
                    <p className="text-muted mb-0 small">{metric.title}</p>
                    <small className="text-muted">{metric.subtitle}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Engagement Breakdown */}
        {data.comments_by_hike && data.comments_by_hike.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Most Commented Hikes</h6>
            <div className="table-responsive">
              <table className={`table table-sm ${isDark ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Hike</th>
                    <th className="text-end">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comments_by_hike.slice(0, 5).map((hike, index) => (
                    <tr key={index}>
                      <td>{hike.hike_name}</td>
                      <td className="text-end">{hike.comment_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.photos_by_hike && data.photos_by_hike.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Most Photographed Hikes</h6>
            <div className="table-responsive">
              <table className={`table table-sm ${isDark ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Hike</th>
                    <th className="text-end">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.photos_by_hike.slice(0, 5).map((hike, index) => (
                    <tr key={index}>
                      <td>{hike.hike_name}</td>
                      <td className="text-end">{hike.photo_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementMetrics;
