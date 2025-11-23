import './EditPhuHuynhform.css'
import {useEffect, useState} from "react";
const EditPhuHuynhform = ({id,close,resetdata}) =>{
    const [name,setName] = useState("");
    const [email, setEmail] = useState("");
    const [sdt, setSdt] = useState("");
    const [address, setAddress] = useState("");
    const resetform = () =>{
        setName("");
        setEmail("");
        setSdt("");
        setAddress("");
    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        const phuhuynh = {ho_ten:name,email:email,so_dien_thoai:sdt,dia_chi:address};
        await fetch(`http://localhost:8080/phuhuynh/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(phuhuynh)
        }).then(()=>resetdata()).then(()=>{close()})


    }

    useEffect(() => {
        const loaddata = async () => {
            const response =await fetch(`http://localhost:8080/phuhuynh/${id}`);
            const data= await response.json();
            console.log(data);
            setName(data[0].ho_ten);
            setEmail(data[0].email);
            setSdt(data[0].so_dien_thoai);
            setAddress(data[0].dia_chi);
        }
        loaddata();
    },[id])

    return(
        <>
            <div className="p-[5%] flex justify-content-lg-start">
                <form className="flex flex-col">
                    <div className="m-[2vh]">
                        <label className="mr-2 font-bold">Tên Phụ Huynh:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]" value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[5.4vw] font-bold">Email:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]"type={email} value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[1.3vw] font-bold">Số Điện Thoại:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]" value={sdt} onChange={(e) => setSdt(e.target.value)}/>
                    </div>
                    <div className="m-[2vh]">
                        <label className="mr-[4.7vw] font-bold">Địa Chỉ:</label>
                        <input className="border-1 border-black rounded-1 p-1 h-[4vh]" value={address} onChange={(e) => setAddress(e.target.value)}/>
                    </div>
                    <div className="flex justify-content-center w-[40vw] mt-[1vh]">
                        <button  className="border-2 border-black mr-[4vw] p-2 w-[5vw] rounded-2 bg-blue-500 text-white "onClick={(e)=>{handleSubmit(e)}} >Thêm</button>
                        <button className="border-2 border-black p-2 w-[5vw] rounded-2 bg-red-500 text-white" onClick={(e)=>{e.preventDefault();close();resetform()}}>Hủy</button>
                    </div>
                </form>

            </div>
        </>
    )
}
export default EditPhuHuynhform