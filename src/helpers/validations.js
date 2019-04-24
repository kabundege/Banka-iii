import joi from 'joi';
import PasswordComplexity from 'joi-password-complexity';

class dataValidations {
  static userSignup(req, res, next) {
    const complexityOptions = {
      min: 8,
      max: 20,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      requirementCount: 2,
    };

    const userSchema = joi.object().keys({
      firstName: joi.string().alphanum().min(3).required(),
      lastName: joi.string().alphanum().min(3).required(),
      gender: joi.string().valid('male', 'female').required(),
      phoneNo: joi.string().required(),
      email: joi.string().email().required(),
      password: new PasswordComplexity(complexityOptions),
      confirmPassword: joi.string().required(),
      type: joi.string().valid('client', 'staff').required(),
      isAdmin: joi.boolean(),
    });
    const {
      firstName, lastName, gender, phoneNo, email, password, confirmPassword, type,
    } = req.body;

    if (!gender) {
      return res.status(400).json({ status: 400, error: 'gender is required' });
    }

    if (!email) {
      return res.status(400).json({ status: 400, error: 'email is required' });
    }

    if (!type) {
      return res.status(400).json({ status: 400, error: 'type is required' });
    }

    const sex = gender.toLowerCase();
    const mail = email.toLowerCase();
    const userType = type.toLowerCase();

    const newUser = userSchema.validate({
      firstName,
      lastName,
      gender: sex,
      phoneNo,
      email: mail,
      password,
      confirmPassword,
      type: userType,
    });

    if (newUser.error) {
      if (newUser.error.details[0].type === 'passwordComplexity.base') {
        return res.status(400).json({ status: 400, error: 'password length must be 8 with atleast an upper, lower case letter, and a number,' });
      }
      return res.status(401).json({ status: 401, error: newUser.error.details[0].message.replace('"', ' ').replace('"', '') });
    }

    req.user = newUser.value;
    next();
  }

  static signIn(req, res, next) {
    const loginSchema = joi.object().keys({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const { email, password } = req.body;
    const credentials = loginSchema.validate({
      email,
      password,
    });

    if (credentials.error) {
      return res.status(401).json({ status: 401, error: credentials.error.details[0].message.replace('"', ' ').replace('"', '') });
    }

    req.user = credentials.value;
    next();
  }

  static validateCreateAccount(req, res, next) {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ status: 401, error: 'type is required' });
    }

    const newAccountSchema = joi.object().keys({
      type: joi.string().valid('current', 'savings').required(),
    });

    const newAccount = newAccountSchema.validate({ type: type.toLowerCase() });

    if (newAccount.error) {
      return res.status(400).json({ status: 401, error: newAccount.error.details[0].message.replace('"', ' ').replace('"', '') });
    }

    req.body = newAccount.value;
    next();
  }

  static validateChangeStatus(req, res, next) {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 401, error: 'account status is required' });
    }

    const newAccountSchema = joi.object().keys({
      status: joi.string().valid('dormant', 'draft', 'active').required(),
    });

    const newStatus = newAccountSchema.validate({ status: status.toLowerCase() });

    if (newStatus.error) {
      return res.status(400).json({ status: 401, error: newStatus.error.details[0].message.replace('"', ' ').replace('"', '') });
    }

    req.body = newStatus.value;
    next();
  }

  static validateTransactionSchema(req, res, next) {

    const transactionSchema = joi.object().keys({
      amount: joi.number().positive().required(),
    });
    if (!req.body.amount) {
      return res.status(400).json({
        status: 400,
        error: 'the amount is required',
      });
    }
    const checkAmount = transactionSchema.validate({
      amount: req.body,
    });
    const { amount } = checkAmount.value;
    req.body = amount;
    next();
  }
}

export default dataValidations;