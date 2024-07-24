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

const helpers = { getUserByEmail };

module.exports = helpers;