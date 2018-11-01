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

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.redirect(301, '/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urlKeys: Object.keys(urlDatabase),
    urlEntries: Object.values(urlDatabase),
    username: req.cookies['username']
  };
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/login', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('pages/login', templateVars);
});

app.post('/urls/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/');
});

app.get('/urls/logout', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('pages/logout', templateVars);
});

app.post('/urls/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('pages/urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    url: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('pages/urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.update;
  res.redirect('/');
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(302, '/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if(longURL){
    res.redirect(302, longURL);
  }else{
    res.sendStatus(404);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})

