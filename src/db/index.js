import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectionDB = async () => {
    try {
        const response = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MONGODB CONNECTION SUCCESSFULLY.");
        return response;
    } catch ( error ) {
        console.log("Mongodb connection faild.");
    }
}
export default connectionDB;