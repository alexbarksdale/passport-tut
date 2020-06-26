const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const connectEnsureLogin = require('connect-ensure-login');

const app = express();

/*  EXPRESS SETUP  */
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

/*  PASSPORT SETUP  */
app.use(passport.initialize());
app.use(passport.session());

/* MONGOOSE SETUP */
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

/* PASSPORT LOCAL AUTHENTICATION */
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

/* ROUTES */
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect('/login?info=' + info);
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }

            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/login', (_, res) => res.sendFile('html/login.html', { root: __dirname }));

app.get('/', connectEnsureLogin.ensureLoggedIn(), (_, res) =>
    res.sendFile('html/index.html', { root: __dirname })
);

app.get('/private', connectEnsureLogin.ensureLoggedIn(), (_, res) =>
    res.sendFile('html/private.html', { root: __dirname })
);

app.get('/user', connectEnsureLogin.ensureLoggedIn(), (req, res) => res.send({ user: req.user }));

/* REGISTER SOME USERS */
// UserDetails.register({ username: 'paul', active: false }, 'paul');
// UserDetails.register({ username: 'jay', active: false }, 'jay');
// UserDetails.register({ username: 'roy', active: false }, 'roy');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));
