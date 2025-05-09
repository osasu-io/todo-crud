module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        // finds all todos in the collection and sends them to the profile.ejs file
        db.collection('todos').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('profile.ejs', {
                user: req.user,
                todos: result // we sending the todos here
            })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
            console.log('User has logged out!')
        });
        res.redirect('/');
    });

// to-do CRUD routes ============================================================

    // CREATE a new todo
    app.post('/todos', (req, res) => {
        //saving a new task with "completed: false" by default
        db.collection('todos').save({ task: req.body.task, completed: false }, (err, result) => {
            if (err) return console.log(err)
            console.log('saved new todo to database')
            res.redirect('/profile')
        })
    })

    // UPDATE - mark todo note as completed or toggle it
    app.put('/todos', (req, res) => {
        db.collection('todos').findOneAndUpdate(
            { task: req.body.task }, // look for this exact task
            {
                $set: {
                    completed: req.body.completed === 'false' ? true : false // toggle true/false
                }
            },
            {
                sort: { _id: -1 },
                upsert: false
            },
            (err, result) => {
                if (err) return res.send(err)
                res.send(result)
            }
        )
    })

    // DELETE a todo note
    app.delete('/todos', (req, res) => {
        db.collection('todos').findOneAndDelete({ task: req.body.task }, (err, result) => {
            if (err) return res.send(500, err)
            res.send('Todo deleted!')
        })
    })

// =============================================================================
// AUTHENTICATE (LOGIN / SIGNUP) ===============================================
// =============================================================================

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// middleware that checks if you’re logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
