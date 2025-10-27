import './App.css';
import SideBar from './LeftSideBar/SideBar';
import { useState } from 'react';
import Header from './Header/Header';
import Route from './Route/Route';
import Taixe from './Taixe/Taixe';
import Dashboard from './Dashboard/Dashboard';
import Schedule from './Schedule/Schedule';
import ThongBao from './ThongBao/Notification';
import { useJsApiLoader } from '@react-google-maps/api';
import Students from './Students/Student';


function App() {
  const [activeMenu, setActiveMenu] = useState('driver');
      const handleMenuClick = (menuId) => {
          setActiveMenu(menuId);
          console.log('Menu clicked:', menuId);
      };
      const renderContent = () => {
    switch (activeMenu) {
      case 'driver':
        return <Taixe />;
      case 'schedule':
        return <Schedule />;
      case 'route':
        return <Route isLoaded={isLoaded} loadError={loadError} />;
      case 'notification':
        return <ThongBao />;
      case 'dashboard':
        return <Dashboard isLoaded={isLoaded} loadError={loadError} />;
      // case 'student':
      //   return <h2>Trang Học sinh</h2>;
      // case 'dashboard':
      //   return <h2>Trang Dashboard</h2>;
      case 'student':
        return <Students/>;
      // default:
      //   return <h2>Chọn menu bên trái</h2>;
    }
  };
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      process.env.REACT_APP_GMAPS_KEY ||
      import.meta?.env?.VITE_GMAPS_KEY ||
      'AIzaSyDtViS_O_TRVKPXi43VpL-ZS3bRLeoOiVY',
    libraries: ['places']
  });
  if (loadError) {
        return <div>Lỗi tải API Google Maps</div>;
    }
  return (
    <div className="App">
      <Header />
      <div className="Main-app">
        <SideBar activeMenu={activeMenu} onMenuClick={handleMenuClick}/>
        <div className="Main-content">{renderContent()}</div>
        {/* <Taixe /> */}
      {/* <Schedule /> */}
      {/* <Route /> */}
      {/* <ThongBao /> */}
      </div>
    </div>
  );
}

export default App;