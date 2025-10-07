import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const UserGrowthChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data?.growth_trend || data.growth_trend.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No growth data available</p>
      </div>
    );
  }

  const chartData = data.growth_trend.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    'New Users': parseInt(item.new_users),
    'Total Users': parseInt(item.cumulative_users)
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'} />
        <XAxis
          dataKey="month"
          stroke={isDark ? '#aaa' : '#666'}
        />
        <YAxis stroke={isDark ? '#aaa' : '#666'} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#2d2d2d' : '#fff',
            border: `1px solid ${isDark ? '#444' : '#ccc'}`,
            borderRadius: '4px',
            color: isDark ? '#fff' : '#000'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="New Users"
          stroke="#0d6efd"
          strokeWidth={2}
          dot={{ fill: '#0d6efd', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Total Users"
          stroke="#198754"
          strokeWidth={2}
          dot={{ fill: '#198754', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default UserGrowthChart;
