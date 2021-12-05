const bcrypt = require('bcrypt-nodejs');

module.exports = {
    compareHash: function (hashValue, plainValue) {
        return bcrypt.compareSync(plainValue, hashValue)
    },
    generateHash: function (value) {
        return bcrypt.hashSync(value, bcrypt.genSaltSync(8), null)

    }
}