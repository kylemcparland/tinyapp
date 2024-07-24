const database = require("./database");
const users = database.users;
const urlDatabase = database.urlDatabase;

const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const methodOverride = require("method-override");
const PORT = 8080; // default port 8080

const { generateRandomString, checkDatabaseForURL, getUserByEmail, urlsForUser } = require("./helpers");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["superSecretKey"]
}));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");


// HOMEPAGE:
app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// REGISTER PAGE:
app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    const templateVars = {
      urls: urlDatabase,
      user: users[currentUser]
    };
    res.render("register", templateVars);
  } else {
    res.redirect(302, "/urls/");
  }
});

// REGISTER POST:
app.post("/register", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (!emailInput) {
    res.status(400).send("Email address field is blank.");
  } else if (!passwordInput) {
    res.status(400).send("Password field is blank.");
  } else {

    if (getUserByEmail(emailInput, users)) {
      res.status(400).send("Email already exists in database.");
    } else {
      const hashedPassword = bcrypt.hashSync(passwordInput, 10);
      const assignUserID = generateRandomString(6);
      users[assignUserID] = {};

      users[assignUserID].id = assignUserID;
      users[assignUserID].email = emailInput.toLowerCase();
      users[assignUserID].password = hashedPassword;

      req.session.user_id = assignUserID;
      console.log(users);
      res.redirect(302, "/urls/");
    }

  }
});

// LOGIN PAGE:
app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    const templateVars = {
      urls: urlDatabase,
      user: users[currentUser]
    };
    res.render("login", templateVars);
  } else {
    res.redirect(302, "/urls/");
  }
});

// LOGIN POST:
app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const checkForUser = getUserByEmail(emailInput, users);

  if (!checkForUser) {
    res.status(403).send("Email does not exist in database.");
  } else if (!bcrypt.compareSync(passwordInput, checkForUser.password)) {
    res.status(403).send("Incorrect password for this account.");
  } else {

    req.session.user_id = checkForUser.id;
    res.redirect(302, "/urls/");
  }

});

// LOGOUT POST:
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect(302, "/login");
});

// FULL URLS DATABASE PAGE:
app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const userDatabase = urlsForUser(currentUser, urlDatabase);
  if (currentUser) {
    const templateVars = {
      urls: userDatabase,
      user: users[currentUser]
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send("You must login before accessing this page.");
  }
});

// URL SUBMIT PAGE:
app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  if (currentUser) {
    const templateVars = {
      urls: urlDatabase,
      user: users[currentUser]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login");
  }
});

// SUBMIT NEW URL:
app.post("/urls", (req, res) => {
  const currentUser = req.session.user_id;

  if (currentUser) {
    const submittedLongURL = req.body.longURL;

    if (submittedLongURL.includes("http://") || submittedLongURL.includes("https://")) {
      const generatedShortURL = generateRandomString(3);

      urlDatabase[generatedShortURL] = {};
      urlDatabase[generatedShortURL].longURL = submittedLongURL;
      urlDatabase[generatedShortURL].userID = currentUser;
      urlDatabase[generatedShortURL].uniqueVisitors = [];
      urlDatabase[generatedShortURL].visitList = [];

      res.redirect(302, "/urls/" + generatedShortURL);
    } else {
      res.send("Invalid URL. Please include 'http://' or 'https://'");
    }

  } else {
    res.status(401).send("Only registered users can shorten URLs.");
  }

});

// VIEW URL-SPECIFIC PAGE:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const currentUser = req.session.user_id;
    const matchingUser = urlDatabase[shortURL].userID;

    if (matchingUser === currentUser) {

      if (urlDatabase[shortURL]) {
        const longURL = urlDatabase[shortURL].longURL;
        const visitList = urlDatabase[shortURL].visitList;
        const uniqueVisitors = urlDatabase[shortURL].uniqueVisitors.length;
        const templateVars = {
          id: shortURL,
          longURL: longURL,
          urls: urlDatabase,
          uniqueVisitors: uniqueVisitors,
          visitList: visitList,
          user: users[currentUser]
        };
        res.render("urls_show", templateVars);
      } else {
        res.send("URL does not exist within database.");
        // redundant
      }

    } else if (currentUser) {
      res.status(401).send("Current user cannot access this page.");
    } else {
      res.status(401).send("Please login before attempting to access this page.");
    }

  }

});

// REDIRECT TO URL USING SHORT URL:
app.get("/u/:id", (req, res) => {
  const urlDB = urlDatabase[req.params.id];

  if (urlDB) {

    // Assign unique visitor_id if none already assigned:
    let visitorID = req.session.visitor_id;
    if (!visitorID) {
      req.session.visitor_id = generateRandomString(6);
      visitorID = req.session.visitor_id;
    }

    // Add visitor_id to uniqueVisitors array if not already in there:
    const visitorDatabase = urlDB.uniqueVisitors;
    if (!visitorDatabase.includes(visitorID)) {
      visitorDatabase.push(visitorID);
    }

    // Track each individual visitor with a timestamp:
    const urlVisits = urlDB.visitList;
    urlVisits.push(`${visitorID} - ${new Date()}`);

    const longURL = urlDB.longURL;
    res.redirect(302, longURL);
  } else {
    res.status(401).send("URL does not exist within database.");
  }

});

// EDIT URL IN DATABASE:
app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const newURL = req.body.newURL;
    const currentUser = req.session.user_id;
    const matchingUser = urlDatabase[shortURL].userID;

    if (matchingUser === currentUser) {
      if (newURL.includes("http://") || newURL.includes("https://")) {
        urlDatabase[shortURL].longURL = newURL;
        res.redirect(302, "/urls/");
      } else {
        res.send("Invalid URL. Please include 'http://' or 'https://'");
      }
    } else if (currentUser) {
      res.status(401).send("Current user cannot access this page.");
    } else {
      res.status(401).send("Please login before attempting to access this page.");
    }

  }

});

// DELETE FROM DATABASE:
app.delete("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const currentUser = req.session.user_id;
    const matchingUser = urlDatabase[shortURL].userID;

    if (matchingUser === currentUser) {
      delete urlDatabase[shortURL];
      res.redirect(302, "/urls/");
    } else if (currentUser) {
      res.status(401).send("Current user cannot perform this action.");
    } else {
      res.status(401).send("Please login before attempting to perform this action.");
    }
  }

});

// JSON API REQUEST:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// START SERVER:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// Edge cases:
//localhost:8080/urls/RANDOMSTRING => Shouldn't bring up a urls page
//localhost:8080/u/RANDOMSTRING => Shouldn't throw an error, it should return info

//handle url already existing in database (recursion?) if (!urlDatabase[generatedShortURL]) { continue }

// does generate random string account for existing IDs? 
// => check for if ID exists before returning

// const {email, password} = req.body;
// (deconstructing object)

// Check for if logic DOESN'T match first

// //Middleware
// cookie parser
// app.set

// You can write RETURN before a redirect

// {heading: req.body[value] || req.body.en}

//on server restart, if a browser has a cookie from a previous iteration of the server, none of the links work

//strLibrary by using the charCodeAt
//For example, in your /register route, you could check to see if the email and password fields are not only present, 
//but also meet certain criteria (e.g., the email is in a valid format, the password is a certain length, etc.).

//You could write more comments for specific lines in the code to aid readability and understandability.