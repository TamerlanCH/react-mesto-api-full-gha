/* eslint-disable no-useless-escape */
const JWT_SECRET = 'mysecretkey';
const URL_REGEXP = /^(ftp|http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-@?^=%&/~\+#])?$/;

module.exports = {
  JWT_SECRET,
  URL_REGEXP,
};
