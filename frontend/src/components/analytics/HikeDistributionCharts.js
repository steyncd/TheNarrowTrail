import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const HikeDistributionCharts = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];

  // Prepare data for charts
  const difficultyData = data.by_difficulty?.map(item => ({
    name: item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1),
    value: parseInt(item.count)
  })) || [];

  const typeData = data.by_type?.map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: parseInt(item.count)
  })) || [];

  const statusData = data.by_status?.map(item => ({
    name: item.status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value: parseInt(item.count)
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: isDark ? '#2d2d2d' : '#fff',
            border: `1px solid ${isDark ? '#444' : '#ccc'}`,
            borderRadius: '4px',
            padding: '8px 12px',
            color: isDark ? '#fff' : '#000'
          }}
        >
          <p className="mb-0">
            <strong>{payload[0].name}:</strong> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="row g-4">
      {/* Hikes by Difficulty */}
      <div className="col-lg-4">
        <div className={`card h-100 ${isDark ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h5 className="card-title mb-4">Hikes by Difficulty</h5>
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Hikes by Type */}
      <div className="col-lg-4">
        <div className={`card h-100 ${isDark ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h5 className="card-title mb-4">Hikes by Type</h5>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Hikes by Status */}
      <div className="col-lg-4">
        <div className={`card h-100 ${isDark ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h5 className="card-title mb-4">Hikes by Status</h5>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'} />
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#aaa' : '#666'}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke={isDark ? '#aaa' : '#666'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0d6efd">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HikeDistributionCharts;
