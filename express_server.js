const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

// middleware from body-parser library that converts the request body from a Buffer into string that can be read
app.use(express.urlencoded({ extended: true }));

// cookie-session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// import helper functions
const { generateRandomString, findUserObj, findEmail, urlsForUser} = require('./helpers');

// set ejs as the view engine
app.set("view engine", "ejs");

// global urls database object
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "something1",
  },
  sm5xK9: {
    longURL: "http://www.google.com",
    userID: "something1",
  },
};

// global users object
const users = {
  something1: {
    id: 'something1',
    email: 'example@example.com',
    password: 'somepassword',
  },
};

// if user logged in, go to urls, else direct to login
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// render registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userID]
  };
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.render("registration", templateVars);
  }
});

// render login page if user logged in
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userID]
  };
  if (req.session.userUD) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});


// route for /urls to render urls ejs template in views folder
app.get("/urls", (req, res) => {
  if (req.session.userID) {
    const templateVars = {
      urls: urlsForUser(req.session.userID, urlDatabase),
      user: users[req.session.userID],
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// get route to render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.userID]
  };
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// add route to render urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.userID]
  };
  if (!req.session.userID) {
    return res.status(400).send('Please Login or Register');
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send("URL does not exist");
  } else if (urlDatabase[req.params.id].userID !== req.session.userID) {
    res.status(404).send("Url does not belong to user");
  } else {
    res.render("urls_show", templateVars);
  }
});

// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// route that genearte short id and adds to urlDatabase, longURL must start with http://, if user is logged in
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  if (req.session.userID) {
    res.redirect(`/urls/${id}`);
  } else {
    res.status(400).send("Must be logged in to access urls");
  }
});

// deletes url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (req.session.userID && (req.session.userID === urlDatabase[id].userID)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send('Not your URL to delete');
  }
});

// update url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (req.session.userID && (req.session.userID === urlDatabase[id].userID)) {
    urlDatabase[req.params.id].longURL = req.body.updateURL;
    res.redirect("/urls");
  } else {
    res.status(403).send('Not your URL to edit');
  }
});

// set name of cookie to username in login page if user and password match existing users
app.post("/login", (req, res) => {
  const user = findUserObj(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.id;
    res.redirect('/urls');
  } else if (!user) {
    return res.status(403).send('User does not exist, please register');
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Please enter the correct password.');
  }
});

// logout endpoint, clears cookie and redirect to login page
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

// add registration info to users object
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findEmail(req.body.email, users)) {
      const id = generateRandomString();
      users[id] = {
        id,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      };
      // set cookie session to random id
      req.session.userID = id;
      // redirect to urls page
      res.redirect("/urls");
    } else {
      return res.status(400).send('Email already registered');
    }
  } else {
    return res.status(400).send('Empty username or password');
  }
});
