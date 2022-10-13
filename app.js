var express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require("fs");
const multer = require("multer");
var imageModel = require('./src/users/user.model');
require("dotenv").config();
const PORT = 5000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection Success.");
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //optional
app.use("view engine","ejs");

 
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
var upload = multer({ storage: storage })
 
app.get("/",(req,res)=>{
    res.render("index");
})

app.post("/uploadphoto",upload.single('myImage'),(req,res)=>{
  var img = fs.readFileSync(req.file.path);
  var encode_img = img.toString('base64');
  var final_img = {
      contentType:req.file.mimetype,
      image:new Buffer(encode_img,'base64')
  };
  imageModel.create(final_img,function(err,result){
      if(err){
          console.log(err);
      }else{
          console.log(result.img.Buffer);
          console.log("Saved To database");
          res.contentType(final_img.contentType);
          res.send(final_img.image);
      }
  })
})

app.get("/ping", (req, res) => {
  return res.send({
    error: false,
    message: "Server is healthy",
  });
});
app.listen(PORT, () => {
  console.log("Server started listening on PORT : " + PORT);
});

module.exports = app