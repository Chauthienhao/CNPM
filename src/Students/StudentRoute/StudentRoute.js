import express from "express";
import {deletestudent, getStudents} from "../StudentController/StudentController.js";
const Router = express.Router();

Router.get("/",getStudents);
Router.delete("/:id",deletestudent);
export default Router;