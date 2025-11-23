import db from "../../config/db.js";
export const getallphuhuynh = async () => {
    try {
        const [rows] = await db.execute("Select * from phuhuynh where TT=1");
        return rows;
    } catch (err) {
        console.log(err);
    }
}
    export const insertphuhuynh = async (phuhuynh) => {
        try{
                await db.execute("INSERT INTO phuhuynh(tai_khoan_id,ho_ten,email,so_dien_thoai,dia_chi) VALUES(?,?,?,?,?)",[phuhuynh.tai_khoan_id,phuhuynh.ho_ten,phuhuynh.email,phuhuynh.so_dien_thoai,phuhuynh.dia_chi]);

        }
        catch(err){
            console.log(err);
        }

}
export const delph = async (id) => {
    try{
        await db.execute("DELETE FROM phuhuynh WHERE id = ?",[id]);
    }
    catch(err){
        console.log(err);
    }
}
export const getphuhuynh = async (id) => {
    const [rows] = await db.execute("SELECT * FROM phuhuynh WHERE id = ?", [id]);
    return rows;
}
export const updatephuhuynh = async (phuhuynh) => {
    try{

        await db.execute("UPDATE phuhuynh SET ho_ten=?,email=?,so_dien_thoai=?,dia_chi=? WHERE id = ?", [phuhuynh.ho_ten,phuhuynh.email,phuhuynh.so_dien_thoai,phuhuynh.dia_chi,phuhuynh.id]);
    }
    catch(err){
        console.log(err);
    }
}
export const findphuhuynh = async (hoten) => {
    try{
        const [rows] =await db.execute("SELECT * from phuhuynh where  ho_ten like ? and TT = 1", [`%${hoten}%`]);
        return rows;
    }
    catch(err){
        console.log(err);
    }
}