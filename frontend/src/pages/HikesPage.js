import React from 'react';
import { Mountain } from 'lucide-react';
import HikesList from '../components/hikes/HikesList';
import PageHeader from '../components/common/PageHeader';

const HikesPage = () => {
  return (
    <div>
      <PageHeader
        icon={Mountain}
        title="Hikes"
        subtitle="Browse and express interest in upcoming hiking adventures"
      />

      <HikesList />
    </div>
  );
};

export default HikesPage;
