const StudentModel = require('../models/Student');
const HttpStatus = require('http-status')
const multer = require('multer')
const path = require('path')
const _ = require('lodash')
const moment = require('moment')
const Jwt = require('jsonwebtoken')
const HashService = require('../services/helper')
const _C = require('../config/constants')
const SignupValidator = require('../validators/SignupValidator');
const loginValidators = require('../validators/loginValidators');

/** 
 * File Upload
*/
var storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (file.fieldname === "profileImage" || file.fieldname === "profileImage") {
            cb(null, 'assets/images/student');
        }

    },
    filename: (req, file, cb) => {

        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            cb(
                null,
                file.fieldname + '-' + Date.now() + path.extname(file.originalname)
            );
        }
    }
});
var upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } }).any();

/** 
 * Profile Image Upload
*/
exports.profileUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            var errors = {};
            errors[err.field] = err.message
            return res.status(400).json({ errors })
        }
        else { next(); }
    })
}

/** 
 * Signup Student
 * url : /api/student/signup
 * method : POST
 * author : Sathyamoorthi.R
 * body   : name,email,mobilenumber,dob,age,department,address
*/
exports.signup = async (req, res) => {

    let dob = req.body.dob;
    let year = Number(dob.substr(0, 4));
    let month = Number(dob.substr(4, 2)) - 1;
    let day = Number(dob.substr(6, 2));
    let today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
        age--;
    }

    try {
        const { errors, isValid } = SignupValidator(req.body);
        if (!isValid) {
            throw { "error": errors }
        }
        let EmailUniqueCheck = await StudentModel.findOne({ 'email': req.body.email }).exec();

        if (EmailUniqueCheck) {
            throw { "error": { "email": "Email already exists" } }
        }
        let mobileUniqueCheck = await StudentModel.findOne({ 'mobilenumber': req.body.mobilenumber }).exec();

        if (mobileUniqueCheck) {
            throw { "error": { "mobile": "Mobile number already exists" } }
        }
        let studentCreate = new StudentModel(req.body);
        var arr = [];
        var profileImage = _.filter(req.files, ['fieldname', 'profileImage']);
        if (profileImage.length !== 0) { arr.push(profileImage[0].path) }
        studentCreate.profileImage = (profileImage.length === 0) ? "" : profileImage[0].filename;
        studentCreate.password = HashService.generateHash(req.body.password);
        studentCreate.age = age;
        studentCreate = await studentCreate.save();

        if (studentCreate && studentCreate.length !== 0) {
            let studentDetails = {
                _id: studentCreate._id,
                name: studentCreate.name,
                DOB: moment(req.body.dob).format('YYYY/MM/DD'),
                age: studentCreate.age,
                mobilenumber: studentCreate.mobilenumber,
                email: studentCreate.email,
                department: studentCreate.department,
                address: studentCreate.address,
            }
            return res.status(HttpStatus.OK).json({ 'success': true, 'message': 'Student data added successfully', 'data': studentDetails });
        } else {

            return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': "Invalid Data" });
        }

    } catch (err) {
        console.log("err", err);
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'data': (err.error) });
    }

};

/** 
 * Student Update
 * url : /api/student/update
 * method : PUT
 * author : Sathyamoorthi.R
 * body   : name,email,mobilenumber,dob,age,department,address
 * params : _id
*/
exports.update = async (req, res) => {

    try {
        let EmailUniqueCheck = await StudentModel.findOne({ 'email': req.body.email }).exec();

        if (EmailUniqueCheck) {
            throw { "error": { "email": "Email already exists" } }
        }
        let mobileUniqueCheck = await StudentModel.findOne({ 'mobilenumber': req.body.mobilenumber }).exec();

        if (mobileUniqueCheck) {
            throw { "error": { "mobile": "Mobile number already exists" } }
        }
        var arr = [];
        var profileImage = _.filter(req.files, ['fieldname', 'profileImage']);
        if (profileImage.length !== 0) { arr.push(profileImage[0].path) }
        var updatedProfileImage = (profileImage.length === 0) ? "" : profileImage[0].filename;

        let studentUpdate = await StudentModel.findOneAndUpdate({
            '_id': req.params.id
        },
            {
                'name': req.body.name,
                'dob': req.body.dob,
                'age': req.body.age,
                'mobilenumber': req.body.mobilenumber,
                'email': req.body.email,
                'department': req.body.department,
                'address': req.body.address,
                'profileImage': updatedProfileImage

            },
            { 'fields': { "_id": 1, "name": 1, "age": 1, "mobilenumber": 1, "email": 1, "department": 1, "profileImage": 1 }, new: true }
        );

        if (studentUpdate && studentUpdate.length !== 0) {

            return res.status(HttpStatus.OK).json({ 'success': true, 'message': "Student details updated successfully", 'data': studentUpdate });
        }
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': "Student not found" });

    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            err.errmsg = req.i18n.__("USER_UNIQUE_ERROR");
        }
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': (err.errmsg) ? (err.errmsg) : err });

    }
};

/** 
 * Student Lists
 * url : /api/student/list
 * method : GET
 * author : Sathyamoorthi.R 
*/
exports.list = async (req, res) => {
    try {

        let StudentList = await StudentModel.find({ status: { $in: [_C.status.student.active, _C.status.student.offline, _C.status.student.online] } }).select('_id name mobilenumber email profileImage').exec();

        if (StudentList && StudentList.length > 0) {
            var user = _.map(StudentList, function (o) {
                return {
                    _id: o._id,
                    name: o.name,
                    mobilenumber: o.mobilenumber,
                    email: o.email,
                    profileImage: (o.profileImage) ? o.profileImage : ""
                }
            })

            return res.status(HttpStatus.OK).json({ 'success': true, 'message': "Student details listed successfully", 'data': user });
        }
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': "Student not found" });
    } catch (err) {
        console.log("error here", err);
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': (err.errmsg) ? (err.errmsg) : err });
    }

}

/** 
 * Delete Student
 * url : /api/student/delete
 * method : PUT
 * author : Sathyamoorthi.R 
 * params : _id
*/
exports.deleteStudent = async (req, res) => {
    try {
        let condition = { _id: req.params.id, status: _C.status.student.active };
        let deleteStudent = await StudentModel.findOneAndUpdate(condition, { status: _C.status.student.deleted }, { new: true });

        if (deleteStudent) {
            return res.status(HttpStatus.OK).json({ 'success': true, 'message': "Student details deleted successfully" });

        } else {
            return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': "Student not found" });
        }
    } catch (err) {
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': (err.errmsg) ? (err.errmsg) : err });

    }
};

/** 
 * Student Login
 * url : /api/student/login
 * method : POST
 * author : Sathyamoorthi.R
 * body   : UserName->(email, phone), password
*/
exports.login = async (req, res) => {

    try {
        const { errors, isValid } = loginValidators(req.body);
        if (!isValid) {
            throw { "error": errors }
        }
        let student = await StudentModel.findOne({ $or: [{ 'email': req.body.username }, { 'mobilenumber': req.body.username }] }, 'status password').exec();

        if (student && ((student.status !== _C.status.student.inactive) && (student.status !== _C.status.student.deleted))) {
            if (HashService.compareHash(student.password, req.body.password)) {

                let StudentData = await StudentModel.findOneAndUpdate({ '_id': student._id }, { 'status': _C.status.student.online }, { new: true });

                let token = Jwt.sign({ _id: student._id, }, _C.API_SECRET, { algorithm: 'HS256', expiresIn: _C.TOKEN.EXPIRE });

                return res.status(HttpStatus.OK).json({ 'success': true, 'message': "User loggedin successfully", "data": token });

            }
            throw { "error": { "password": "Invalid password" } }

        } else {
            throw { "error": { "username": "Invalid username" } }
        }
    } catch (err) {
        console.log("error", err);
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'data': (err.error) ? (err.error) : err });

    }
}

/** 
 * Student Logout
 * url : /api/student/logout
 * method : PUT
 * author : Sathyamoorthi.R
 * params : _id
*/
exports.logout = async function (req, res) {

    try {
        let condition = { _id: req.params.id };
        let StudentData = await StudentModel.findOneAndUpdate(condition, { status: _C.status.student.offline }, { new: true });
        if (StudentData && StudentData !== 0) {

            return res.status(HttpStatus.OK).json({ 'success': true, 'message': "User logged out successfully" });
        }

        throw { errmsg: "Student not found" }

    } catch (err) {
        console.log(err)
        return res.status(HttpStatus.NOT_FOUND).json({ 'success': false, 'message': (err.errmsg) ? (err.errmsg) : err });
    }
}




































exports.product_details = function (req, res) {
    Product.findById(req.params.id, function (err, product) {
        if (err) return next(err);
        res.send(product);
    })
};

exports.product_update = function (req, res) {
    Product.findByIdAndUpdate(req.params.id, { $set: req.body },
        function (err, product) {
            if (err) return next(err);
            res.send('Product is updated.');
        });
};

exports.product_delete = function (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err) {
        if (err) return next(err);
        res.send('Deleted product' + req.params.id + 'succesfully')
    })
};