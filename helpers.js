// generate random string
function generateRandomString() {
  let s = '';
  s += Math.random().toString(36).slice(2);
  return s.slice(0, 6);
}


//check to see if user exists
const findEmail = (email, users) => {
  for (let user in users) {
    if (email === users[user].email) {
      return email;
    }
  }
  return undefined;
};

// return user obj / id by email
const findUserObj = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};



module.exports = { generateRandomString, findUserObj, findEmail };