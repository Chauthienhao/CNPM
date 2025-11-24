import "./Phuhuynh.css"
import {useEffect, useRef, useState} from "react";
import AddPhuHuynhform from "./PhuhuynhUI/AddPhuHuynhform.js";
import EditPhuHuynhform from "./PhuhuynhUI/EditPhuHuynhform.js";

const Phuhuynh = () => {
    const [Phuhuynh,setPhuhuynh] = useState([]);
    const [id, setId] = useState("");
    const [search, setSearch] = useState("");
    const addform = useRef(null);
    const mainform = useRef(null);
    const editform = useRef(null);
    useEffect(() => {
        const fetchDataa = async () => {
            const response = await fetch("http://localhost:5000/phuhuynh");
            const data = await response.json();
            setPhuhuynh(data);


        }
        fetchDataa();
    },[])
    const findData = async () => {
        if(search=="")
        {
            fetchData();
        }
        else {
            const response = await fetch(`http://localhost:5000/phuhuynh/search/${search}`);
            const data = await response.json();
            console.log(data);
            setPhuhuynh(data);
        }
    }



    const openform = () =>{
        addform.current.style.display = 'block';
        mainform.current.style.display = 'none';

    }
    const openeditform = () =>{
        editform.current.style.display = 'block';
        mainform.current.style.display = 'none';
    }
    const closeform = () =>{

        addform.current.style.display = 'none';
        mainform.current.style.display = 'block';
    }
    const closeEditform = () =>{
        editform.current.style.display = 'none';
        mainform.current.style.display = 'block';
    }
    const fetchData = async () => {
        const response = await fetch("http://localhost:5000/phuhuynh");
        const data = await response.json();
        setPhuhuynh(data);

    }
    const deletee = async (id) => {
        if (window.confirm("Bạn có muốn xóa không?")) {
            try {
                const res = await fetch(`http://localhost:5000/phuhuynh/${id}`, {
                    method: 'DELETE',
                });
                if(res.ok){
                    window.alert("Đã xóa thành công");
                    fetchData();
                }
            } catch (err) {
                console.error(err);
                alert("Xóa thất bại!");
            }
        }
    };
    useEffect(()=>{
        findData();
    },[search]);
    return(
        <>
            <div ref={mainform}>
            <div className="title">
                <h1 className="">Quản Lý Phụ Huynh</h1>
            </div>
            <div className="search-form">
                <input placeholder="Tìm kiếm Phụ Huynh...." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
                <br/>
                <button className="add-btn" type="button " onClick={() =>{openform()}} >Thêm Phụ Huynh</button>
            </div>
            <div className="table-form">
                <table className="hocsinh-table">
                    <thead>
                    <tr>
                        <th>ID Phụ Huynh</th>
                        <td>ID Tài Khoản</td>
                        <th>Tên Phụ Huynh</th>
                        <th>Email</th>
                        <th>Số Điện Thoại</th>
                        <th>Địa Chỉ</th>
                        <th>Thao Tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Phuhuynh.map((ph) => (
                        <tr key={ph.id}>
                            <td>{ph.id}</td>
                            <td>{ph.tai_khoan_id}</td>
                            <td>{ph.ho_ten}</td>
                            <td>{ph.email}</td>
                            <td>{ph.so_dien_thoai}</td>
                            <td>{ph.dia_chi}</td>

                            <td><button className="edit-btn" onClick={()=>{setId(ph.id.toString());openeditform()}}>Sửa</button> <button className="delete-btn" onClick={()=>{deletee(ph.id.toString());  }}>Xóa</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </div>
            <div className="border-2 rounded-2 absolute top-[20%] left-[30%] w-[45vw] h-[55vh] bg-white hidden" ref={addform}>
            <AddPhuHuynhform close={closeform} resetdata={fetchData} />

            </div>
            <div className="border-2 rounded-2 absolute top-[20%] left-[30%] w-[45vw] h-[50vh] bg-white hidden" ref={editform}>
                <EditPhuHuynhform close={closeEditform} resetdata={fetchData} id={id} />

            </div>
        </>
    )
}
export default Phuhuynh;