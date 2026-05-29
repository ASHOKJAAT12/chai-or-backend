import express from 'express';
import conectionDB from './db/index.js';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

const app = express();
const PORT = process.env.PORT;

conectionDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`server is running at ${PORT}`);
    })
})
.catch( ( error ) => {
    console.log("Mongodb connection faild.",error);
})