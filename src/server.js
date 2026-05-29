import express from 'express';
import conectionDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';
dotenv.config({
    path: './.env'
});

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