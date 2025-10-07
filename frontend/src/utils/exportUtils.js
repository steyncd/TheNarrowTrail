// Export utility functions for CSV, JSON, and reporting

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  let csvContent = headers.join(',') + '\n';

  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Convert arrays/objects to strings
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      // Escape quotes and wrap in quotes if contains comma
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }

      return value;
    });

    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateHikeReport = (hikes) => {
  const report = {
    generatedAt: new Date().toISOString(),
    totalHikes: hikes.length,
    summary: {
      byDifficulty: {},
      byType: {},
      byStatus: {},
      byMonth: {}
    },
    hikes: hikes.map(hike => ({
      id: hike.id,
      name: hike.name,
      date: hike.date,
      difficulty: hike.difficulty,
      type: hike.type,
      status: hike.status,
      interestedCount: hike.interested_users?.length || 0,
      confirmedCount: hike.confirmed_users?.length || 0
    }))
  };

  // Calculate summaries
  hikes.forEach(hike => {
    // By difficulty
    report.summary.byDifficulty[hike.difficulty] =
      (report.summary.byDifficulty[hike.difficulty] || 0) + 1;

    // By type
    report.summary.byType[hike.type] =
      (report.summary.byType[hike.type] || 0) + 1;

    // By status
    const status = hike.status || 'unknown';
    report.summary.byStatus[status] =
      (report.summary.byStatus[status] || 0) + 1;

    // By month
    const month = new Date(hike.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    report.summary.byMonth[month] =
      (report.summary.byMonth[month] || 0) + 1;
  });

  return report;
};

export const exportHikeReport = (hikes, format = 'json') => {
  const report = generateHikeReport(hikes);
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    exportToJSON(report, `hike-report-${timestamp}.json`);
  } else if (format === 'csv') {
    exportToCSV(report.hikes, `hike-report-${timestamp}.csv`);
  }
};

export const exportUserData = (user, hikes, format = 'json') => {
  const userData = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    exportedAt: new Date().toISOString(),
    hikesHistory: hikes.map(hike => ({
      name: hike.name,
      date: hike.date,
      difficulty: hike.difficulty,
      type: hike.type,
      status: hike.status,
      wasInterested: hike.interested_users?.includes(user.id),
      wasConfirmed: hike.confirmed_users?.includes(user.id)
    }))
  };

  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    exportToJSON(userData, `my-hiking-data-${timestamp}.json`);
  } else if (format === 'csv') {
    exportToCSV(userData.hikesHistory, `my-hiking-data-${timestamp}.csv`);
  }
};
