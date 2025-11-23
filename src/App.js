import './App.css';
import LoginModal from './components/Authentication/LoginModal';  
import SideBar from './LeftSideBar/SideBar';
import { useState } from 'react';
import Header from './Header/Header';
import Route from './Route/Route';
import Dashboard from './Dashboard/Dashboard';
import Schedule from './Schedule/Schedule';
import ThongBao from './ThongBao/Notification';
import { useJsApiLoader } from '@react-google-maps/api';
import Students from './Students/StudentUI/Student';
import Taixe from './Taixe/Taixe';

// Định nghĩa menu cho từng role
const ROLE_MENUS = {
  admin: ['dashboard','route','driver','student','schedule','notification'],
  driver: ['schedule','student','notification','route'],
  parent: ['route','notification','schedule']
};

function App() {
  const [activeMenu, setActiveMenu] = useState('schedule');
  // cần khai báo state để theo dõi đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        return <Dashboard isLoaded={isLoaded} loadError={loadError} onNavigate={handleMenuClick} />;
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
  // 3. Tạo hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
  if (loadError) {
    return <div>Lỗi tải API Google Maps</div>;
  }

  // 4. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
  // Nếu chưa đăng nhập (isLoggedIn là false)
  if (!isLoggedIn) {
    return (
      <div className="App">
        <div className="Main-app">
          {/* Hiển thị LoginModal và truyền hàm handleLoginSuccess vào */}
          <LoginModal 
            onLoginSuccess={handleLoginSuccess}
            onClose={() => alert("Bạn phải đăng nhập để tiếp tục")} // Có thể thông báo
            onOpenSignup={() => { /* Xử lý mở modal đăng ký */ }}
          />
        </div>
      </div>
    );
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