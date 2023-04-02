const express = require('express');
const mongoose = require('mongoose');
const app = express();
const connectDB = require('./config/db')
connectDB();
const path = require('path')

const PORT = 3000;
app.use(express.static('public'))
app.use(express.json());
//mongodb connection



// mongoose.connection.on('error', (error) => console.log(error))


//init server
function initServer() {
    app.listen(PORT, function check(error){
        if(error) console.log("Error has occured");
        console.log(`Server is started on port ${PORT}`);
    });
}
initServer()

// Template Engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')


//Routes
app.use('/api/files', require('./routes/files'))
app.use('/files', require('./routes/show'))
app.use('/files/download', require('./routes/download'))
