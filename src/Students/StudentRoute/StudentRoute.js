import express from "express";
import {
    getonestudent,
    getStudents,
    suastudent,
    themhs,
    timstudent,
    xoastudent
} from "../StudentController/StudentController.js";
const Router = express.Router();

Router.get("/",getStudents);
Router.post("/",themhs);
Router.get("/:id",getonestudent);
Router.put("/:id",suastudent);
Router.get("/search/:name",timstudent);
Router.delete("/:id",xoastudent);
export default Router;