const Joi = require("joi");
const jwt = require('jwt-simple');
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

const User = require("./user.model");
const Task = require("./user.model")
//Validate user schema
const userSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }),
  name: Joi.string().required(),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});



// SIGNUP FUNCTION

exports.Signup = async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      console.log(result.error.message);
      return res.json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }
    //Check if the email has been already registered.
    var user = await User.findOne({
      email: result.value.email,
    });
    if (user) {
      return res.json({
        error: true,
        message: "Email is already in use",
      });
    }
    const hash = await User.hashPassword(result.value.password);
    const id = uuid(); //Generate unique id for the user.
    result.value.userId = id;
   //remove the confirmPassword field from the result as we dont need to save this in the db.
   delete result.value.confirmPassword;
   result.value.password = hash;

    const newUser = new User(result.value);
    await newUser.save();
    const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    return res.cookie({ 'token': token }).json({ success: true, message: 'User registered successfully', data: user })
    // return res.status(200).json({
    //   success: true,
    //   message: "Registration Success",
    // });
  } catch (error) {
    console.error("signup-error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot Register",
    });
  }
};

// LOGIN FUNCTION
exports.Login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: "Cannot authorize user.",
        });
      }
      //1. Find if any account with that email exists in DB
      const user = await User.findOne({ email: email });
      // NOT FOUND - Throw error
      if (!user) {
        return res.status(404).json({
          error: true,
          message: "Account not found",
        });
      }
    //   //2. Throw error if account is not activated
    //   if (!user.active) {
    //     return res.status(400).json({
    //       error: true,
    //       message: "You must verify your email to activate your account",
    //     });
    //   }
      //3. Verify the password is valid
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({
          error: true,
          message: "Invalid credentials",
        });
      }
      const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,});
      return res.cookie({"token":token}).json({success:true,message:'LoggedIn Successfully'})
      await user.save();
      
      //Success
      return res.send({
        success: true,
        message: "User logged in successfully",
       });
    } catch (err) {
      console.error("Login error", err);
      return res.status(500).json({
        error: true,
        message: "Couldn't login. Please try again later.",
      });
    }
  };

//   TASK CRUD
// CREATE TASK

exports.createTask = async (req, res) => {
    
    Task.create({ taskId: uuid(), userId: req.body.userId, title: req.body.title, dueDate: req.body.dueDate, attachmentFile: req.body.attachmentFile   }, function (error, data) {
        //console.log('data userrole ', data);
        if (error)
          res.status(500).json({ "statusCode": 500, "errorMsg": "Failed to create Task", "hasError": true, data: error });
        else
          res.status(200).json({ "statusCode": 200, "message": "Task created successfully", "hasError": false, data });
      })
  }

exports.editTask = async (req, res) => {

    console.log(req.body)
    Task.findOneAndUpdate({ taskId: req.body.taskId }, { $set: { title: req.body.title, dueDate: req.body.dueDate, attachmentFile: req.body.attachmentFile } }, function (error, data) {
        if (error){
            res.status(500).json({ "statusCode": 500, "errorMsg": "Failed to update Task", "hasError": true, data: error });
        }
        else
          res.status(200).json({ "statusCode": 200, "message": "task updated successfully", "hasError": false, data });
      })
    }

exports.deleteTask = async(req, res) => {

    var myquery = {taskId:req.body.taskId};
    Task.deleteOne(myquery, function(err) {
        if (err){
            res.status(500).json({ "statusCode": 500, "errorMsg": "Failed to delete Task", "hasError": true, data: err });
        }
        else
          res.status(200).json({ "statusCode": 200, "message": "task deleted successfully", "hasError": false});
})
}

exports.listTask = async(req, res) => {

    var query = {userId: req.body.userId}
    Task.find(query, function (error, data) {
        if (error) {
          res.status(error.statusCode).send(error);
        }
        else {
          res.status(200).json({ "statusCode": 200, "message": "Tasks fetch successfully", "hasError": false, data });
        }
      });
}