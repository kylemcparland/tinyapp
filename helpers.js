// FUNCTION TO CHECK FOR EMAIL IN DATABASE:
const getUserByEmail = function(email, database) {
  if (!email) {
    return undefined;
  }
  const newEmail = email.toLowerCase();
  for (const user in database) {
    const userEmail = database[user].email.toLowerCase();
    if (userEmail === newEmail) {
      const foundUser = database[user];
      return foundUser;
    }
  }
  return undefined;
};

// FUNCTION FOR PARSE URL DATABASE BY USER:
const urlsForUser = function(id, database) {
  let userDatabase = {};
  for (const url in database) {
    const currentUserID = database[url].userID;
    if (currentUserID === id) {
      userDatabase[url] = database[url].longURL;
    }
  }
  return userDatabase;
}

const helpers = { getUserByEmail, urlsForUser };

module.exports = helpers;