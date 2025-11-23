import {delstudent, getallstudents} from "../StudentModel/StudentModel.js";

export const getStudents = async (req, res) => {
    try{
        const [row] = await getallstudents();
        res.json(row);
    }
    catch(err){
        res.status(400).json({error: err});
    }

}
export const deletestudent = async (req,res) => {
    try{
        await delstudent(req.params.id);
        res.status(200).json({message:"Xóa học sinh thành công"});
    }
    catch(err){
        res.status(400).json({error: err});
    }
}