import React from 'react';
import Schedule from '../Schedule/Schedule';
import Students from '../Students/Student';
import ThongBao from '../ThongBao/Notification';
import Route from '../Route/Route';
import Taixe from '../Taixe/Taixe';
import Dashboard from '../Dashboard/Dashboard';
import { useJsApiLoader } from '@react-google-maps/api';

const Admin = () => {
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
      <h2>Quản lý — Toàn quyền</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <Dashboard isLoaded={isLoaded} loadError={loadError} />
        <Route isLoaded={isLoaded} loadError={loadError} />
        <Taixe />
        <Students />
        <Schedule />
        <ThongBao />
      </div>
    </div>
  );
};

export default Admin;