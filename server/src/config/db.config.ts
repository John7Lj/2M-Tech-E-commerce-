// config/db.config.ts
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, { dbName: 'new_2m' });
    } catch (error) {
        throw error;
    }
};

export default connectDB;