// pages/PhotosPage.js
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import PhotoGallery from '../components/photos/PhotoGallery';
import PhotoUpload from '../components/photos/PhotoUpload';
import PageHeader from '../components/common/PageHeader';

const PhotosPage = () => {
  return (
    <div>
      <PageHeader
        icon={ImageIcon}
        title="Photos"
        subtitle="Share and browse photos from hiking adventures"
      />
      <PhotoUpload />
      <PhotoGallery />
    </div>
  );
};

export default PhotosPage;
