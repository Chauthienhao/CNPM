import "./Student.css"
const Students = () => {
    const hocsinh = [{Name: "Hàn Gia Hào",ID: "ABC",TT:'Hoạt động',Email:"HGH@gmail.com"},
        {Name: "Hàn Gia Hào",ID: "ABC",TT:'Hoạt động',Email:"HGH@gmail.com"},
        {Name: "Hàn Gia Hào",ID: "ABC",TT:'Hoạt động',Email:"HGH@gmail.com"},
        {Name: "Hàn Gia Hào",ID: "ABC",TT:'Hoạt động',Email:"HGH@gmail.com"},
        {Name: "Hàn Gia Hào",ID: "ABC",TT:'Hoạt động',Email:"HGH@gmail.com"}]
    const getStatusClass = (status) => {
        switch (status) {
            case 'Hoạt động':
                return 'status active';
            case 'Không hoạt động':
                return 'status inactive';
            case 'Bận':
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
                    <th>Tên Học Sinh</th>
                    <th>Trạng Thái</th>
                    <th>Email</th>
                    <th>Thao Tác</th>
                </tr>
                </thead>
                <tbody>
                {hocsinh.map((hs) => (
                    <tr key={hs.ID}>
                        <td>{hs.ID}</td>
                        <td>{hs.Name}</td>
                        <td className={getStatusClass(hs.TT)}>{hs.TT}</td>
                        <td>{hs.Email}</td>
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