const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    if (!["/login", "/register"].includes(req.path.replace("/api", ""))) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).send("Forbidden");
        }
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.headers["x-access-user"] = decoded;
        } catch (err) {
            console.log("FAILED", err);
            return res.status(401).send("Invalid authentication");
        }
    }
    return next();
};

module.exports = verifyToken;