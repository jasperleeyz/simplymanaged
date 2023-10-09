const bcrypt = require("bcryptjs");

export const hashPassword = (password: string, salt: string) => {
    return bcrypt.hashSync(password, salt);
}

export const checkPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
}

export const generateSalt = () => {
    return bcrypt.genSaltSync(10);
}
