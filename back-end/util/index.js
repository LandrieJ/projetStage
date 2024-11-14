const bcrypt = require('bcryptjs');

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const getPagingData = (data, page, limit) => {
  const {count: totalItems, rows: items} = data;
  const currentPage = page ? page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {totalItems, items, totalPages, currentPage};
};

const generateCode = ($length = 8) => {
  let $number = "0123456789";
  let $randNum;
  let $randStr = "";
  let $userList;

  for(let i = 1; i <= $length; i++){
    $userList = $number;
    $randNum = Math.floor(Math.random() * $userList.length);
    $randStr = $randStr + $userList.charAt($randNum);
  }

  return $randStr;
};

const generateString = ($length = 12) => {
  let $letter = "0123456789azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN-_";
  let $randLtr;
  let $randStr = "";
  let $userList;

  for(let i = 1; i <= $length; i++){
    $userList = $letter;
    $randLtr = Math.floor(Math.random() * $userList.length);
    $randStr = $randStr + $userList.charAt($randLtr);
  }

  return $randStr;
};

module.exports = {
  hashPassword,
  getPagingData,
  generateCode,
  generateString
};