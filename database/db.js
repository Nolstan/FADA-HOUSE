require('dotenv').config();
const mongoose = require('mongoose');
const connectionString = process.env.MONGO_URI;
 
const connectDB = async () => {
    await mongoose.connect(connectionString)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
        });
};

module.exports = connectDB;