import {
    getallphuhuynh,
    insertphuhuynh,
    getphuhuynh,
    updatephuhuynh,
    delph,
    findphuhuynh
} from "../PhuhuynhModel/Phuhuynhmodel.js";

export const getallph = async (req, res) => {
    try{
        const rows = await getallphuhuynh();
        res.json(rows);
    }
    catch(err){
        console.log(err);
    }
}
export const themph = async (req, res) => {
    const phuhuynh={ho_ten:req.body.ho_ten,email:req.body.email,so_dien_thoai:req.body.so_dien_thoai,dia_chi:req.body.dia_chi};
    try{
        await insertphuhuynh(phuhuynh);
        res.json(phuhuynh);
    }
    catch(err){
        res.send(err);
    }
}
export const xoaph = async (req, res) => {
    const id =req.params.id;
    try{
        await delph(id);
        res.send("delete thành công");
    }
    catch(err){
        console.log(err);
    }
}
export const timph = async (req, res) => {
    const id =req.params.id;
    try{
        const phuhuynh = await getphuhuynh(id);
        res.json(phuhuynh);
    }
    catch(err){
        res.send(err);
    }
}
export const suaph = async (req, res) => {
    const ph={id:parseInt(req.params.id),ho_ten:req.body.ho_ten,email:req.body.email,so_dien_thoai:req.body.so_dien_thoai,dia_chi:req.body.dia_chi};
    try{
        await updatephuhuynh(ph);
        res.json(ph);
    }
    catch (err)
    {
        res.send(err);
    }

}
export const timkiemph = async (req, res) => {
    try{
        const hoten =req.params.ho_ten;
        const phuhuynh = await findphuhuynh(hoten);
        res.json(phuhuynh);
    }
    catch(err){
        res.send(err);
    }
}