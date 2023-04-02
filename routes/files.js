const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const File = require('../models/fileModel')
const { v4 : uuid4 } = require('uuid') 

require('dotenv').config();


let storage = multer.diskStorage({
    destination : (req, file, callback) => callback(null, 'uploads/'),
    filename: (req, file, callback) => {
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        callback(null, uniqueFileName);
    } 
})


let upload = multer({
    storage: storage,
    limit: {fileSize : 1000000 * 100},
}).single('myfile');

router.post('/', (req, res) => {

    // Validate the request

    // Store the files
    upload(req, res, async (err) => {
        if(req.file == false){
            res.send("All fields are mandatory");
        }
        if(err) return res.status(500).send({error: err.message});

        //If there is no error
        // Store into the database
        const file  = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
        //http://localhost:3000/files/345678hgdfsghwedjd
    })
    

    // Response --> Download link

});

router.post('/send', async (req, res) => {
    const {uuid, emailTo, emailFrom } = req.body;

    // Validate request
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error: "All Fields are required"})
    }
    
    //  Get dat from database
    const file = await File.findOne({uuid: uuid})
    if(file.sender){
        return res.status(422).send({error: "Emails already sent."})
    }

    file.sender = emailFrom;
    file.receiver = emailTo;

    const response = await file.save()

    // send email
    const sendMail = require('../services/emailService');
    const template = require('../services/emailTemplate')
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'File Sharing App',
        text: `${emailFrom} shared a file with you...`,
        html: template({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${uuid}`,
            size: parseInt(file.size/1000) + ' KB',
            expires: '24 Hrs'

        })
    });

    return res.send({sucess: true})
})
module.exports = router;