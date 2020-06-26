const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname));
const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

mongoose.connect('mongodb://localhost/MyDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String,
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));
