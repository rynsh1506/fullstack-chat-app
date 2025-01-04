import AppError from "./error.util.js";

export const passwordValidation = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }
  if (!uppercaseRegex.test(password)) {
    throw new AppError(
      "Password must contain at least one uppercase letter.",
      400
    );
  }
  if (!lowercaseRegex.test(password)) {
    throw new AppError(
      "Password must contain at least one lowercase letter.",
      400
    );
  }
  if (!numberRegex.test(password)) {
    throw new AppError("Password must contain at least one number.", 400);
  }
  if (!specialCharRegex.test(password)) {
    throw new AppError(
      "Password must contain at least one special character.",
      400
    );
  }
};

export const emailValidation = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new AppError("Invalid email format.", 400);
  }
};

export const fullnameValidation = (fullname) => {
  if (!fullname) {
    throw new AppError("Fullname must be at least 1 characters long.", 400);
  }
};
