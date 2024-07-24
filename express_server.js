const database = require("./database");
const users = database.users;
const urlDatabase = database.urlDatabase;

const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// FUNCTION TO CREATE NEW URLS:
const generateRandomString = function() {
  let randomString = "";
  const strLibrary =
    [
      "a", "b", "c", "d", "e", "f", "g",
      "h", "i", "j", "k", "l", "m", "n",
      "o", "p", "q", "r", "s", "t", "u",
      "v", "w", "x", "y", "z", "A", "B",
      "C", "D", "E", "F", "G", "H", "I",
      "J", "K", "L", "M", "N", "O", "P",
      "Q", "R", "S", "T", "U", "V", "W",
      "X", "Y", "Z", "1", "2", "3", "4",
      "5", "6", "7", "8", "9", "0", "!"
    ];

  while (randomString.length < 6) {
    const libraryIndex = Math.floor(Math.random() * 62);
    randomString += strLibrary[libraryIndex];
  }

  return randomString;
};

// FUNCTION TO CHECK FOR EMAIL IN DATABASE:
const getEmailinDatabase = function(email) {
  const newEmail = email.toLowerCase();
  for (const user in users) {
    const userEmail = users[user].email.toLowerCase();
    if (userEmail === newEmail) {
      return users[user];
    }
  }
  return null;
};

// FUNCTION FOR PARSE URL DATABASE BY USER:
const urlsForUser = function(id) {
  let userDatabase = {};
  for (const url in urlDatabase) {
    const currentUserID = urlDatabase[url].userID;
    if (currentUserID === id) {
      userDatabase[url] = urlDatabase[url].longURL;
    }
  }
  return userDatabase;
}

// FUNCTION CHECK IF SHORT URL EXISTS:
const checkDatabaseForURL = function(url) {
  for (const currentURL in urlDatabase) {
    if (currentURL === url) {
      return true;
    }
  }
  return false;
}

// HOMEPAGE:
app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// REGISTER PAGE:
app.get("/register", (req, res) => {
  const currentUser = req.cookies.user_id;
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

    if (getEmailinDatabase(emailInput)) {
      res.status(400).send("Email already exists in database.");
    } else {
      const hashedPassword = bcrypt.hashSync(passwordInput, 10);
      const assignUserID = generateRandomString();
      users[assignUserID] = {};
    
      users[assignUserID].id = assignUserID;
      users[assignUserID].email = emailInput;
      users[assignUserID].password = hashedPassword;
    
      res.cookie("user_id", assignUserID);
    
      res.redirect(302, "/urls/");
    }
    
  }
});

// LOGIN PAGE:
app.get("/login", (req, res) => {
  const currentUser = req.cookies.user_id;
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

// LOGIN:
app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const checkForUser = getEmailinDatabase(emailInput);

  if (!checkForUser) {
    res.status(403).send("Email does not exist in database.");
  } else if (!bcrypt.compareSync(passwordInput, checkForUser.password)) {
    res.status(403).send("Incorrect password for this account.");
  } else {

    res.cookie("user_id", checkForUser.id);
    res.redirect(302, "/urls/");
  }

  console.log(users);

});

// LOGOUT:
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(302, "/login");
});

// FULL URLS DATABASE PAGE:
app.get("/urls", (req, res) => {
  const currentUser = req.cookies.user_id;
  const userDatabase = urlsForUser(currentUser);
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

// SUBMIT NEW URL:
app.post("/urls", (req, res) => {
  const currentUser = req.cookies.user_id;
  
  if (currentUser) {
    const submittedLongURL = req.body.longURL;

    if (submittedLongURL.includes("http://") || submittedLongURL.includes("https://")) {
      const generatedShortURL = generateRandomString();

      urlDatabase[generatedShortURL] = {};
      urlDatabase[generatedShortURL].longURL = submittedLongURL;
      urlDatabase[generatedShortURL].userID = currentUser;

      res.redirect(302, "/urls/" + generatedShortURL);
    } else {
      res.send("Invalid URL. Please include 'http://' or 'https://'");
    }

  } else {
    console.log(urlDatabase);
    res.status(401).send("Only registered users can shorten URLs.");
  }

});

// URL SUBMIT PAGE:
app.get("/urls/new", (req, res) => {
  const currentUser = req.cookies.user_id;
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

// VIEW URL-SPECIFIC PAGE:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  
  if (!checkDatabaseForURL(shortURL)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const currentUser = req.cookies.user_id;
    const matchingUser = urlDatabase[shortURL].userID;

    if (matchingUser === currentUser) {

      if (urlDatabase[shortURL]) {
        const longURL = urlDatabase[shortURL].longURL;
        const templateVars = {
          id: shortURL,
          longURL: longURL,
          urls: urlDatabase,
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
  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(302, longURL);
  } else {
    res.status(401).send("URL does not exist within database.");
  }

});

// EDIT URL IN DATABASE:
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!checkDatabaseForURL(shortURL)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const newURL = req.body.newURL;
    const currentUser = req.cookies.user_id;
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
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (!checkDatabaseForURL(shortURL)) {
    res.status(404).send("URL does not exist within database.");
  } else {

    const currentUser = req.cookies.user_id;
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

//Feedback suggestions:
//Refactor generateRandomString to store characters in a string instead of an array

//handle url already existing in database (recursion?) if (!urlDatabase[generatedShortURL]) { continue }

// convert email to lowercase on registration

// does generate random string account for existing IDs? 
// => check for if ID exists before returning

// !tab creates a skeleton on an ejs file

// const {email, password} = req.body;
// (deconstructing object)

// Check for if logic DOESN'T match first

// //Middleware
// cookie parser
// app.set

// You can write RETURN before a redirect

// {heading: req.body[value] || req.body.en}

//on server restart, if a browser has a cookie from a previous iteration of the server, none of the links work