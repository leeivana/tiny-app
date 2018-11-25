const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'keypass',
}));
app.use(methodOverride('_method'));
app.use(express.static('views'));

//Databases for URLs and also Users
const urlDatabase = {
  'b2xVn2': {url:'http://www.lighthouselabs.ca', userID: 'user3RandomID'},
  'fjslrl': {url:'http://www.facebook.com', userID: 'user1RandomID'},
  '9sm5xk': {url:'http://www.google.com', userID: 'user2RandomID'},
  '4js94k': {url:'http://www.instagram.com', userID: 'user2RandomID'},
  'jtl2hr': {url:'http://www.youtube.com', userID: 'user1RandomID'},
};


const users = {
  "user1RandomID": {
    id: "user1RandomID",
    email: "user1@example.com",
    password: bcrypt.hashSync("user1", 15),
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("user2", 15),
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("user3", 15),
  }
};

//helper functions
const checkURL = (id) => {
  const object = {};
  const entries = Object.entries(urlDatabase);
  for(let i in entries){
    if(entries[i][1].userID === id){
      object[entries[i][0]] = entries[i][1].url;
    }
  }
  return object;
}

const generateRandomString = (string) => {
  return sha256(string).slice(0,6);
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
  if(!req.session.user_id){
    res.redirect('/urls/login');
  }
  const templateVars = {
    urlKeys: Object.keys(checkURL(req.session.user_id)),
    urlEntries: Object.values(checkURL(req.session.user_id)),
    user_id: req.session.user_id,
    userDB: users,
  };
  res.render('pages/urls_index', templateVars);
});
//login form
app.get('/urls/login', (req, res) => {
  const templateVars = {user_id: req.session.user_id, userDB: users}
  res.render('pages/login', templateVars);
});
//setting user_id cookie to the id of the user that is logged in
app.post('/urls/login', (req, res) => {
  const validUser = Object.values(users).find(user => user.email === req.body.email);
  const id = validUser.id;
  if(validUser && bcrypt.compareSync(req.body.password, validUser.password)){
    req.session.user_id = id
    res.redirect('/');
  }else{
    res.sendStatus(403);
  };
});
//rendering registration page
app.get('/urls/register', (req, res) => {
  const templateVars = {user_id: req.session.user_id, userDB: users}
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
    password: bcrypt.hashSync(req.body.password, 15),
  };
  req.session.user_id = id;
  console.log(users);
  res.redirect('/');

  res.sendStatus(400);
  console.log('Enter another email');
  redirect('/urls/register');

});
//deleting cookies for logout
app.post('/urls/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});
//new URL
app.get('/urls/new', (req, res) => {
  if(!req.session.user_id){
    res.redirect('/urls/login');
  }
  console.log(users);
  const templateVars = {user_id: req.session.user_id, userDB: users}
  res.render('pages/urls_new', templateVars);
});

//showing individual url
app.get('/urls/:id', (req, res) => {
  const id1 = req.session.user_id;
  const id2 = urlDatabase[req.params.id].userID;
  if(id1 !== id2){
    res.redirect('/unauthorized');
    return;
  }
  const templateVars = {
    shortURL: req.params.id,
    url: urlDatabase,
    user_id: req.session.user_id,
    userDB: users,
    timesVisited: req.session[req.params.id],
  };
  console.log(req.session[req.params.id]);
  res.render('pages/urls_show', templateVars);
});

app.get('/unauthorized', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    url: urlDatabase,
    user_id: req.session.user_id,
    userDB: users,
  };
  res.render('pages/unauthorized', templateVars);
});

//editing individual url
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id].url = req.body.update;
  res.redirect('/');
});
//generating a random 6 letter string for shortURL and putting it in database
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(longURL);
  urlDatabase[shortURL] = {userID: req.session.user_id, url: longURL};
  res.redirect(302, '/urls');
});
//redirecting to longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  let date = new Date();
  req.session[req.params.shortURL] = (req.session[req.params.shortURL] || 0) + 1;

// date: {userID: [dateAccessed]}

  if(!urlDatabase[req.params.shortURL].date){
    urlDatabase[req.params.shortURL].date = {};
  }
  if(!urlDatabase[req.params.shortURL].date[req.session.user_id]){
    urlDatabase[req.params.shortURL].date[req.session.user_id] = [];
  }
  urlDatabase[req.params.shortURL].date[req.session.user_id].push(date);

  if(longURL){
    res.redirect(longURL);
  }else{
    res.sendStatus(404);
  }
});
//deleting urls
app.delete('/urls/:id/', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
})

