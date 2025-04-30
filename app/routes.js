const { ObjectId } = require('mongodb'); // ✅ Correct ObjectId import

module.exports = function(app, passport, db) {

  // Normal Routes ===============================================================

  // Home Page
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // Profile Page (only if logged in)
  app.get('/profile', isLoggedIn, async function(req, res) {
    try {
      const todos = await db.collection('todos').find({ userId: req.user._id }).toArray();
      res.render('profile.ejs', {
        user: req.user,
        todos: todos
      });
    } catch (err) {
      console.log(err);
      res.redirect('/');
    }
  });

  // Logout
  app.get('/logout', function(req, res) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  // CRUD Routes ===============================================================

  // Create new to-do
  app.post('/todos', isLoggedIn, async (req, res) => {
    try {
      await db.collection('todos').insertOne({
        userId: req.user._id,
        todo: req.body.todo,
        done: false
      });
      console.log('Saved to database');
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      res.redirect('/profile');
    }
  });

  // Mark as done
  app.put('/todos', isLoggedIn, async (req, res) => {
    try {
      await db.collection('todos').findOneAndUpdate(
        { _id: new ObjectId(req.body.id) },  // ✅ Use "new ObjectId"
        { $set: { done: true } },
        { returnDocument: 'after' }          // ✅ Modern Mongo option
      );
      res.json('Marked Done');
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  // Delete To-Do
  app.delete('/todos', isLoggedIn, async (req, res) => {
    try {
      await db.collection('todos').deleteOne(
        { _id: new ObjectId(req.body.id) }   // ✅ Use "new ObjectId"
      );
      res.json('Deleted');
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  // Auth Routes ===============================================================

  // Login
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // Signup
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // Unlink Local account
  app.get('/unlink/local', isLoggedIn, async function(req, res) {
    try {
      req.user.local.email = undefined;
      req.user.local.password = undefined;
      await req.user.save();
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      res.redirect('/profile');
    }
  });

};

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
