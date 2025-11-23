import express from 'express'
const app = express();
import cors from 'cors';
import StudentsRouter from './src/Students/StudentRoute/StudentRoute.js'
import PhuhuynhRouter from './src/Phuhuynh/PhuHuynhRoute/PhuhuynhRoute.js'
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use("/student",StudentsRouter);
app.use("/phuhuynh",PhuhuynhRouter)



app.listen(8080,() =>{
    console.log("Server started on port 8080");
})