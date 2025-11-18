import React from 'react';
import Schedule from '../Schedule/Schedule';
import Students from '../Students/StudentUI/Student';
import ThongBao from '../ThongBao/Notification';
import Route from '../Route/Route';
import { useJsApiLoader } from '@react-google-maps/api';

const Driver = () => {
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
      <h2>Tài xế</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <Schedule />
        <Students />
        <ThongBao />
        <Route isLoaded={isLoaded} loadError={loadError} />
      </div>
    </div>
  );
};

export default Driver;