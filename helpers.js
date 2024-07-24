// FUNCTION TO CHECK FOR EMAIL IN DATABASE:
const getUserByEmail = function(email, database) {
  const newEmail = email.toLowerCase();
  for (const user in database) {
    const userEmail = database[user].email.toLowerCase();
    if (userEmail === newEmail) {
      const foundUser = database[user];
      return foundUser;
    }
  }
  return null;
};

module.exports = getUserByEmail;