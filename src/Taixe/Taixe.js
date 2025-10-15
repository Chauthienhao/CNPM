import React, { useState } from 'react';
import Header from '../Header/Header';
import SideBar from '../LeftSideBar/SideBar';
import './Taixe.css';
function Taixe() {
    const [activeMenu, setActiveMenu] = useState('taixe');
    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        console.log('Menu clicked:', menuId);
    };
  return (
    <div className="app-wrapper">
        <Header />
        <div className="Main">
            {/* Sidebar trái */}
            <SideBar />

            {/* Phần chính - Main và Search */}
            <div className="taixe-main">
                <h1 className='taixe-title'>Quản lý tài xế</h1>
            </div>
        </div>
            
    </div>
  );
}

export default Taixe;