// => Generate short URLs/IDs:
const generateRandomString = function(strLength) {
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
      "5", "6", "7", "8", "9", "0"
    ];

  while (randomString.length < strLength) {
    const libraryIndex = Math.floor(Math.random() * (strLibrary.length - 1));
    randomString += strLibrary[libraryIndex];
  }

  return randomString;
};

// => Find URL in database:
const checkDatabaseForURL = function(url, database) {
  for (const currentURL in database) {
    if (currentURL === url) {
      return true;
    }
  }
  return false;
};

// => Find email in database:
const getUserByEmail = function(email, database) {
  if (!email) {
    return undefined;
  }
  const newEmail = email.toLowerCase();
  for (const user in database) {
    const userEmail = database[user].email;
    if (userEmail === newEmail) {
      const foundUser = database[user];
      return foundUser;
    }
  }
  return undefined;
};

// => Parse URL database for user's URLs:
const urlsForUser = function(id, database) {
  let userDatabase = {};
  for (const url in database) {
    const currentUserID = database[url].userID;
    if (currentUserID === id) {
      userDatabase[url] = database[url].longURL;
    }
  }
  return userDatabase;
};

module.exports = { generateRandomString, checkDatabaseForURL, getUserByEmail, urlsForUser };