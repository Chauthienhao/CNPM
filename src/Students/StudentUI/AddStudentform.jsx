import {useState} from "react";

const AddStudentform = ({resetdata,close}) =>{
    const [name,setName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("Chưa đón");
    const [phid, setPhid] = useState("");
    const resetform = () =>{
        setName("");
        setEmail("");
        setStatus("Chưa đón");
        setPhid("");
    }
    const handleSubmit = (e) =>{
        e.preventDefault();
        const hocsinh = {phu_huynh_id:phid,ho_ten:name,email:email,status:status};
        fetch('http://localhost:5000/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hocsinh)
        }).then(()=>{resetform()}).then(()=>{resetdata()}).then(()=>{close()})

    }
    return(
        <>

            <div className="p-[5%] flex justify-content-lg-start">
                <form className="flex flex-col">
                    <div className="m-[2vh]">
                        <label className="mr-2 font-bold">Tên Học Sinh:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]" value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[4.5vw] font-bold">Email:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]"type={email} value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[1vw] font-bold">ID Phụ Huynh</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]" value={phid} onChange={(e) => setPhid(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[1vw] font-bold">Trạng Thái</label>
                        <select className="border-1 border-black rounded-1 p-1 h-[4vh]" onChange={(e) => setStatus(e.target.value)} value={status}>
                            <option value="Đã đón">Đã đón</option>
                            <option value="Chưa đón">Chưa đón</option>
                            <option value="Nghỉ">Nghỉ</option>
                        </select>
                    </div>

                    <div className="flex justify-content-center w-[40vw] mt-[1vh]">
                        <button  className="border-2 border-black mr-[4vw] p-2 w-[5vw] rounded-2 bg-blue-500 text-white "onClick={(e)=>{handleSubmit(e)}} >Thêm</button>
                        <button className="border-2 border-black p-2 w-[5vw] rounded-2 bg-red-500 text-white" onClick={(e)=>{e.preventDefault();resetform();close()}}>Hủy</button>
                    </div>
                </form>

            </div>
        </>
    )
}
export default AddStudentform;