import db from "../../config/db.js";

export const getallstudents = async () => {
    const data = await db.execute("SELECT * FROM hocsinh");
    return data;
}
export const delstudent = async (id) => {
    await db.execute("delete from hocsinh where id = ?", id);

}