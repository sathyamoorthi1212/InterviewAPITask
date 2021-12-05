const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var jwtOptions = {};
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  jwtOptions.secretOrKey = 'secretfortaskworld';

const StudentModel = require('../models/Student');

module.exports = passport => passport.use(
  new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    StudentModel.findOne({ username: jwt_payload.username }, (err, student) => {
      if (student) {
        return done(null, student);
      }
      return done(null, false).catch(err => {
        console.log(err);
        return done(err, false);
      });
    });
  })
);