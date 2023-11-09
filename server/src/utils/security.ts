const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const hashPassword = (password: string, salt: string) => {
    return bcrypt.hashSync(password, salt);
}

export const checkPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
}

export const generateSalt = () => {
    return bcrypt.genSaltSync(10);
}

export const generatePasswordResetToken = (email: string) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "5m" });
}

export const verifyPasswordResetToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}