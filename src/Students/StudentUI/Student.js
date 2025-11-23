import "./Student.css"
import {useEffect, useState} from "react";
const Students = () => {
   const [hocsinh,setHocsinh] = useState([]);
   useEffect(() => {
       const fetchData = async () => {
           const response = await fetch("http://localhost:8080/student");
           const data = await response.json();
           setHocsinh(data);
       }
       fetchData();
   })
    const getStatusClass = (status) => {
        switch (status) {
            case 'Đã đón':
                return 'status active';
            case 'Chưa đón':
                return 'status inactive';
            case 'Nghỉ':
                return 'status busy';
            default:
                return 'status';
        }
    };
    return(
        <>
            <div className="title">
                <h1 className="">Quản Lý Học Sinh</h1>
            </div>
            <div className="search-form">
                <input placeholder="Tìm kiếm học sinh...." className="search-input" />
                <br/>
                <button className="add-btn" type="button " >Thêm Học Sinh</button>
            </div>
            <div className="table-form">
                <table className="hocsinh-table">
                    <thead>
                    <tr>
                        <th>ID </th>
                        <th>ID Phụ Huynh</th>
                        <th>Tên Học Sinh</th>
                        <th>Email</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {hocsinh.map((hs) => (
                        <tr key={hs.id}>
                            <td>{hs.id}</td>
                            <td>{hs.phu_huynh_id}</td>
                            <td>{hs.ho_ten}</td>
                            <td>{hs.email}</td>
                            <td className={getStatusClass(hs.status)}>{hs.status}</td>

                            <td><button className="edit-btn">Sửa</button> <button className="delete-btn">Xóa</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default Students;