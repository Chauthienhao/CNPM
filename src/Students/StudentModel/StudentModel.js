import db from "../../config/db.js";

export const getallstudents = async () => {
    const data = await db.execute("SELECT * FROM hocsinh where TT=1");
    return data;
}
export const addstudents = async (data) => {
    try {
        await db.execute("INSERT INTO hocsinh(phu_huynh_id,ho_ten,email,status) VALUES(?,?,?,?)", [data.phu_huynh_id, data.ho_ten, data.email,data.status]);
    } catch (err) {
        console.log(err);
    }

}
export const getstudents = async (id) => {
    try{
        const [rows]= await db.execute("SELECT * FROM hocsinh where tt=1 and id=?",[id]);
        return rows;
    }
    catch(err){
        console.log(err);

    }
}
export const updatestudents = async (data) => {
    try{
        await db.execute("UPDATE hocsinh set ho_ten=?,phu_huynh_id=?,email=?,status=? where id=?", [data.ho_ten,data.phu_huynh_id,data.email,data.status,data.id]);

    }
    catch(err){
        console.log(err);
    }
}
export const findstudent = async (name) => {
    try{
        const [rows]=await db.execute("select * from hocsinh where ho_ten like ? and tt=1",[`%${name}%`]);
        return rows;
    }
    catch(err){
        console.log(err);
    }
}
export const deletestudent = async (id) => {
    try{
        await db.execute("UPDATE hocsinh set tt=2 where id=?",[id]);
    }
    catch(err){
        console.log(err);
    }
}
