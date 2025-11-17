import './App.css';
import LoginModal from './components/Authentication/LoginModal';  
import SideBar from './LeftSideBar/SideBar';
import { useEffect, useState } from 'react';
import Header from './Header/Header';
import Route from './Route/Route';
import Dashboard from './Dashboard/Dashboard';
import Schedule from './Schedule/Schedule';
import ThongBao from './ThongBao/Notification';
import { useJsApiLoader } from '@react-google-maps/api';
import Students from './Students/Student';
import Taixe from './Taixe/Taixe';
import { ROLE_CONFIGS } from './ApplicableObject';
import { logout } from './services/api';

function App() {
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentRole(user.role);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentRole('admin');
  };
  
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  // Normalize URL to root 
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);
  
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

  if (!isLoggedIn) {
    return (
      <div className="Main-app">
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => {}} onOpenSignup={() => {}} />
      </div>
    );
  }

  return (
    <div className="App">
      <Header onLogout={handleLogout} />
      
      <div className="Main-app">
        <SideBar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          allowedMenuIds={ROLE_CONFIGS[currentRole]?.menus}
        />
        <div className="Main-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
