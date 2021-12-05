const mongoose = require('mongoose');
const colors = require('colors');
const _C = require('../config/constants');


try {
    var db = mongoose.connect(`mongodb://${_C.database.host}:${_C.database.port}/${_C.database.dbname}`, function (error) {

        if (error) {
            console.log('error'.red)
        } else {
            console.log('Connection with database succeeded.'.blue);
        }
    });
} catch (err) {

    console.log('Connection failed.');

}

module.exports = { mongoose };