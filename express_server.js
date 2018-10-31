const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');

app.set('view engine', 'ejs');
app.use(express.static('./public' + '/public'));
app.use(express.static('views'));
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = {urlKeys: Object.keys(urlDatabase), urlEntries: Object.values(urlDatabase)};
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {shortURL: req.params.id, urlDB: urlDatabase};
  res.render('pages/urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.update;
  res.redirect('/');
});

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  longURL = longURL.includes('http://www.') ? longURL += '' : 'http://www.' + longURL;
  const shortURL = generateRandomString(longURL);
  urlDatabase[shortURL] =[longURL];
  res.redirect(301, '/urls/'+shortURL);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(301, '/urls');
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(301, longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})

