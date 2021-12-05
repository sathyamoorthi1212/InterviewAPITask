const express = require('express')
const product = require('./router/StudentRoutes'); //imports routes
const app = express()
const path = require('path')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status')
const _C = require('./config/constants')
const port = _C.server.port;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());


/*Database connection*/
require('./config/mongoose');

/*Authorization init and check */
const passportAuth = passport.authenticate("jwt", { session: false });
app.use(passport.initialize());
require('./config/passport')(passport);

/*Router */
app.use('/api/student', require('./router/StudentRoutes'));
app.use(express.static(path.join(__dirname, 'assets/images')));
app.get('/', (req, res) => {

    return res.status(HttpStatus.OK).send("Api working");
})


app.listen(port, () => {
    console.log(('Server is up and running on port number ' + port).blue);
});