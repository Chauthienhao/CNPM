import React from 'react';
import Schedule from '../Schedule/Schedule';
import ThongBao from '../ThongBao/Notification';
import Route from '../Route/Route';
import { useJsApiLoader } from '@react-google-maps/api';

const Parent = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      process.env.REACT_APP_GMAPS_KEY ||
      'AIzaSyDtViS_O_TRVKPXi43VpL-ZS3bRLeoOiVY',
    libraries: ['places']
  });

  if (loadError) {
    return <div>Lỗi tải API Google Maps</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Phụ huynh</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <Route isLoaded={isLoaded} loadError={loadError} />
        <ThongBao />
        <Schedule />
      </div>
    </div>
  );
};

export default Parent;