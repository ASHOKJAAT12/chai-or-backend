import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get('/',(req, res)=>{
    res.send("chai or backend");
})

app.listen(PORT,(req, res)=> {
    console.log(`server is live on port ${PORT}`);
})