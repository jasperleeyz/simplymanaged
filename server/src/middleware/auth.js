const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    if (!["/login", "/registration", "/forget-password"].includes(req.path.replace("/api", "")) &&
        !req.path.replace("/api", "").startsWith("/reset-password")
        && !req.path.replace("/api", "").startsWith("/code/registration")
        && !req.path.replace("/api", "").startsWith("/subscription/model")
        && !req.path.replace("/api", "").startsWith("/test") // TODO: to remove after testing
    ) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).send("Invalid authentication");
        }
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.headers["x-access-user"] = decoded;
        } catch (err) {
            return res.status(401).send("Invalid authentication");
        }
    }
    return next();
};

module.exports = verifyToken;