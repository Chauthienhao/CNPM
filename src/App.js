import './App.css';
import SideBar from './LeftSideBar/SideBar';
import { useState } from 'react';
import Header from './Header/Header';
import Route from './Route/Route';
import Dashboard from './Dashboard/Dashboard';
import Schedule from './Schedule/Schedule';
import ThongBao from './ThongBao/Notification';
import { useJsApiLoader } from '@react-google-maps/api';
import Students from './Students/Student';
import Taixe from './Taixe/Taixe';

// Định nghĩa menu cho từng role
const ROLE_MENUS = {
  admin: ['dashboard','route','driver','student','schedule','notification'],
  driver: ['schedule','student','notification','route'],
  parent: ['route','notification','schedule']
};

function App() {
  const [activeMenu, setActiveMenu] = useState('schedule');
  // Hardcode role để test 
  const currentRole = 'admin'; 
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
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
      case 'student':
        return <Students/>;
      default:
        return null;
    }
  };
  
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
    <div className="App">
      <Header />
      
      <div className="Main-app">
        <SideBar 
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          allowedMenuIds={ROLE_MENUS[currentRole]}
        />
        <div className="Main-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;