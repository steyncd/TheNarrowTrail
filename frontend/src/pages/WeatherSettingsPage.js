import React from 'react';
import { CloudRain } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import WeatherSettings from '../components/admin/WeatherSettings';
import PermissionGate from '../components/PermissionGate';

function WeatherSettingsPage() {
  return (
    <PermissionGate requiredPermission="manage_settings" requireAdmin>
      <div className="container-fluid py-4">
        <PageHeader 
          icon={CloudRain}
          title="Weather API Configuration"
          subtitle="Configure weather data providers and test connectivity"
        />
        
        <div className="row">
          <div className="col-12">
            <WeatherSettings />
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

export default WeatherSettingsPage;
