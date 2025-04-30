var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // LOCAL SIGNUP
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async function(req, email, password, done) {
        try {
            const existingUser = await User.findOne({ 'local.email': email });
            if (existingUser) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }
            const newUser = new User();
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            await newUser.save();
            return done(null, newUser);
        } catch (err) {
            return done(err);
        }
    }));

    // LOCAL LOGIN
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async function(req, email, password, done) {
        try {
            const user = await User.findOne({ 'local.email': email });
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }
            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Wrong password.'));
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
};
