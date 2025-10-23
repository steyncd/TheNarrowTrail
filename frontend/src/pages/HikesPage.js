import React from 'react';
import { Mountain } from 'lucide-react';
import HikesListEnhanced from '../components/hikes/HikesListEnhanced';
import PageHeader from '../components/common/PageHeader';

const HikesPage = () => {
  return (
    <div>
      <PageHeader
        icon={Mountain}
        title="Events"
        subtitle="Browse and express interest in upcoming outdoor adventures"
      />

      <HikesListEnhanced />
    </div>
  );
};

export default HikesPage;
