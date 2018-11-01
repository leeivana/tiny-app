const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('views'));

const generateRandomString = (string) => {
  return sha256(string).slice(0,6);
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

const users = {
  "user1RandomID": {
    id: "user1RandomID",
    email: "user1@example.com",
    password: "user1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "user2"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "lee.ivana@hotmail.com",
    password: "123"
  }
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
//redirecting to /urls
app.get('/', (req, res) => {
  res.redirect(301, '/urls');
});
//displaying URLs
app.get('/urls', (req, res) => {
  const templateVars = {
    urlKeys: Object.keys(urlDatabase),
    urlEntries: Object.values(urlDatabase),
    user_id: req.cookies['user_id'],
    userDB: users,
  };
  res.render('pages/urls_index', templateVars);
});
//login form
app.get('/urls/login', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], userDB: users}
  res.render('pages/login', templateVars);
});
//creating cookie to remember login user_id
app.post('/urls/login', (req, res) => {
  const validUser = Object.values(users).find(user => user.email === req.body.email);
  const validPassword = Object.values(users).find(user => user.password === req.body.password);
  const id = validUser.id;
  if(validUser && validPassword){
    res.cookie('user_id', id);
    res.redirect('/');
  }else{
    res.sendStatus(403);
  };
});
//rendering registration page
app.get('/urls/register', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], userDB: users}
  res.render('pages/register', templateVars);
});
//getting new user & password and adding to database
app.post('/urls/register', (req, res) => {
  const id = generateRandomString(req.body.email);
  const isValidEmail = Object.values(users).find(user => user.email === req.body.email);
  if(isValidEmail){
    res.sendStatus(400);
  }
  if(!req.body.email || !req.body.password){
    res.sendStatus(400);
  }else{
    Object.keys(users).forEach(function(userID){
    console.log(id);
    if(id === userID){
      res.sendStatus(400);
    }
    });
  }

  users[id] = {
    id : id,
    email : req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', id);
  console.log(users);
  res.redirect('/');

  res.sendStatus(400);
  console.log('Enter another email');
  redirect('/urls/register');

});
//deleting cookies
//logout
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});
//new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], userDB: users}
  res.render('pages/urls_new', templateVars);
});
//showing individual url
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    url: urlDatabase,
    user_id: req.cookies['user_id'],
    userDB: users,
  };
  res.render('pages/urls_show', templateVars);
});
//editing individual url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.update;
  res.redirect('/');
});
//generating a random 6 letter string for shortURL and putting it in database
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(302, '/urls');
});
//redirecting to longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if(longURL){
    res.redirect(longURL);
  }else{
    res.sendStatus(404);
  }
});
//deleting urls
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})

