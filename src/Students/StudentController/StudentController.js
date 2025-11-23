import {
    addstudents,
    deletestudent,
    findstudent,
    getallstudents,
    getstudents,
    updatestudents
} from "../StudentModel/StudentModel.js";

export const getStudents = async (req, res) => {
    try{
        const [row] = await getallstudents();
        res.json(row);
    }
    catch(err){
        res.status(400).json({error: err});
    }

}
export const themhs = async (req, res) => {
    try{
        const hocsinh={phu_huynh_id:req.body.phu_huynh_id,ho_ten:req.body.ho_ten,email:req.body.email,status:req.body.status};
        await addstudents(hocsinh);
        res.json(hocsinh);
    }
    catch(err){
        res.status(400).json({error: err});
    }
}
export const getonestudent = async (req, res) => {
    try{
        const id = parseInt(req.params.id);
        const rows = await getstudents(id);
        res.json(rows);
    }
    catch(err){
        res.status(400).json({error: err});
    }
}
export const suastudent = async (req, res) => {
    try{
        const id = parseInt(req.params.id);

        const hocsinh={id:id,phu_huynh_id:req.body.phu_huynh_id,ho_ten:req.body.ho_ten,email:req.body.email,status:req.body.status};
        await updatestudents(hocsinh);
        res.json(hocsinh);
    }
    catch(err){
        res.status(400).json({error: err});
    }
}
export const timstudent = async (req, res) => {
    try{
        const name = req.params.name;
        const rows = await findstudent(name);
        res.json(rows);
    }
    catch(err){
        res.status(400).json({error: err});
    }
}
export const xoastudent = async (req, res) => {
    try{
        const id = parseInt(req.params.id);
        await deletestudent(id);
        res.json("Đã xóa thành công");
    }
    catch(err){
        res.status(400).json({error: err});
    }
}