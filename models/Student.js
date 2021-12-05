const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _C = require('../config/constants');


function getImage(v) {
    if (v) {
        return `${_C.server.uri}${_C.path.studentImagePath}${v}`;

    } else {
        return null;
    }
}

let StudentSchema = new Schema({
    name: { type: String, required: true, max: 12 },
    password: { type: String, required: true },
    dob: { type: Date },
    mobilenumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    department: { type: String, required: true, max: 12 },
    address: { type: String, required: true, max: 12 },
    profileImage: { type: String, get: getImage },
    status: {
        type: Number,
        enum: [_C.status.student.active, _C.status.student.inactive, _C.status.student.online, _C.status.student.offline, _C.status.student.deleted],
        default: _C.status.student.active,
        required: true
    }
},
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        versionKey: false,
        collection: 'student'
    });

//Export the model
let studentModel = mongoose.model('Student', StudentSchema)
module.exports = studentModel;
