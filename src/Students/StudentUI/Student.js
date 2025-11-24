import "./Student.css"
import {useEffect, useRef, useState} from "react";
import AddStudentform from "./AddStudentform.jsx";
import EditStudentForm from "./EditStudentForm.jsx";
const Students = () => {
   const [hocsinh,setHocsinh] = useState([]);
   const [search, setSearch] = useState("");
   const [id, setId] = useState("");
    const addform = useRef(null);
    const mainform = useRef(null);
    const editform = useRef(null);
   useEffect(() => {
       const fetchData = async () => {
           const response = await fetch("http://localhost:5000/students");
           const data = await response.json();
           setHocsinh(data);
       }
       fetchData();
   },[])
    const findData = async () => {
        if(search=="")
        {
            resetdata();
        }
        else {
            const response = await fetch(`http://localhost:5000/student/search/${search}`);
            const data = await response.json();
            console.log(data);
            setHocsinh(data);
        }
    }
    useEffect(()=>{
        findData();
    },[search]);
    const resetdata = async () => {
        const response = await fetch("http://localhost:5000/student");
        const data = await response.json();
        setHocsinh(data);
    }
    const closeform = () =>{

        addform.current.style.display = 'none';
        mainform.current.style.display = 'block';
    }
    const openeditform = () =>{
        editform.current.style.display = 'block';
        mainform.current.style.display = 'none';
    }
    const closeEditform = () =>{
        editform.current.style.display = 'none';
        mainform.current.style.display = 'block';
    }
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
    const openform = () =>{
        addform.current.style.display = 'block';
        mainform.current.style.display = 'none';

    }
    const deletee = async (id) => {
        if (window.confirm("Bạn có muốn xóa không?")) {
            try {
                const res = await fetch(`http://localhost:5000/student/${id}`, {
                    method: 'DELETE',
                });
                if(res.ok){
                    window.alert("Đã xóa thành công");
                   resetdata();
                }
            } catch (err) {
                console.error(err);
                alert("Xóa thất bại!");
            }
        }
    };
    return(
        <>
            <div ref={mainform}>
            <div className="title">
                <h1 className="">Quản Lý Học Sinh</h1>
            </div>
            <div className="search-form">
                <input placeholder="Tìm kiếm học sinh...." className="search-input" value={search}  onChange={(e)=>setSearch(e.target.value)}/>
                <br/>
                <button className="add-btn" type="button " onClick={()=>{openform()}}>Thêm Học Sinh</button>
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

                            <td><button className="edit-btn"  onClick={()=>{setId(hs.id.toString());openeditform()}}>Sửa</button> <button className="delete-btn" onClick={()=>{deletee(hs.id.toString());}}>Xóa</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </div>
            <div className="border-2 rounded-2 absolute top-[20%] left-[30%] w-[45vw] h-[45vh] bg-white hidden" ref={addform}>
                <AddStudentform resetdata={resetdata} close={closeform} />

            </div>
            <div className="border-2 rounded-2 absolute top-[20%] left-[30%] w-[45vw] h-[45vh] bg-white hidden" ref={editform}>
                <EditStudentForm resetdata={resetdata} close={closeEditform} id={id}/>

            </div>
        </>
    )
}
export default Students;
