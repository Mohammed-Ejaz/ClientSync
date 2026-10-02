import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Add a strict timeout so it fails quickly instead of buffering for 10 seconds
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};