const validator = require("validator");
const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);


module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.name = !isEmpty(data.name) ? data.name : "";
  data.dob = !isEmpty(data.dob) ? data.dob : "";
  data.mobilenumber = !isEmpty(data.mobilenumber) ? data.mobilenumber : "";

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (!validator.isDate(data.dob)) {
    errors.dob = "Date format is invalid & Use YYYY/MM/DD OR YYYY-MM-DD Format";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (validator.isEmpty(data.mobilenumber)) {
    errors.mobilenumber = "Mobile number field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};