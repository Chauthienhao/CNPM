import './App.css';
import SideBar from './LeftSideBar/SideBar';
import { useState } from 'react';
import Header from './Header/Header';
import Route from './Route/Route';
import Taixe from './Taixe/Taixe';
import Schedule from './Schedule/Schedule';
import ThongBao from './ThongBao/Notification';

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
        return <Route />;
      case 'notification':
        return <ThongBao />;
      // case 'dashboard':
      //   return <h2>Trang Dashboard</h2>;
      // case 'student':
      //   return <h2>Trang Học sinh</h2>;
      // default:
      //   return <h2>Chọn menu bên trái</h2>;
    }
  };
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