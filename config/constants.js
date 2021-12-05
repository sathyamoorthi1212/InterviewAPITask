var Path = require('path');

module.exports = {
    status: {

        student: { active: 1, inactive: 2, deleted: 3, online: 4, offline: 5 },

    },
    path: {
        studentImagePath: '/student/',

    },
    server: {
        port: 8000,
        uri: 'http://localhost:8000'
    },
    database: {
        host: 'localhost',
        port: 27017,
        dbname: 'InterviewTask'
    },
    TOKEN: {
        EXPIRE: '24h'
    },
    API_SECRET: 'secretfortaskworld'
}

