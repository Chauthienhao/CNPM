import Header from '../Header/Header';
import SideBar from '../LeftSideBar/SideBar';
import './Taixe.css';
function Taixe() {
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