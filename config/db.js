require('dotenv').config();
const mongoose = require('mongoose')


function connectDB() {
    mongoose.connect("mongodb://127.0.0.1:27017/FileSharingAppDB")
    .then(() => {console.log("Connected to Database");})
    .catch((err) => { console.log("Not Connected to Database ERROR! ", err);});
}

module.exports = connectDB;