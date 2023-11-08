import { PrismaClient } from "@prisma/client";
import express from "express";
import { routes } from "./routes/index";
import { checkPassword, generatePasswordResetToken, generateSalt, hashPassword, verifyPasswordResetToken } from "./utils/security";
import { sendPasswordResetEmail, sendRejectedEmail } from "./utils/email";
import { USER_STATUS } from "./utils/constants";
import { ValidationError } from "./errors/validation-error";

const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
// serve files for react client
app.use(express.static(path.join(__dirname, "../client/build")));

// set cors options
const corsOptions = {
  origin: process.env.WEBPAGE_URL,
  optionsSuccessStatus: 200,
};
// use cors
app.use(cors(corsOptions));

// to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// to parse application/json
app.use(bodyParser.json());
// to parse multipart/form-data
app.use(upload.array());

app.use(cookieParser());

// use auth middleware
app.use(auth);

// create logger


// use master router
app.use("/api", routes);

app.post(`/test/email`, async (req, res) => {
  // console.info("In " + req.path);
  try {
    await sendRejectedEmail(
      "jasperleejk@gmail.com",
      "Jasper Lee",
      "SIM Global Education",
      // {username: "jasperleejk@gmail.com", password: "password"}
    ).then(() => {
      res.status(200).send("Email sent");
    }).catch((error) => {
      console.error(error);
      res.status(400).send("Error sending email.");
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error sending email.");
  }
});

app.post(`/test/encoding`, async (req, res) => {
  try {
    const buf = Buffer.from(req.body.profile_image);

    res.status(200).send(buf.toString());
  } catch (error) {
    console.error(error);
    res.status(400).send("Error encoding.");
  }
});

app.post(`/api/login`, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Both email and password are required");
    }

    // TODO: to remove after testing
    const getRole = (email: string) => {
      if (email === "superadmin@email.com") return "SA";
      else if (email === "systemadmin@email.com") return "A";
      else if (email === "manager@email.com") return "M";
      else return "E";
    };
    // TODO: to remove if else after testing
    let user = undefined;
    if (
      [
        "superadmin@email.com",
        "systemadmin@email.com",
        "manager@email.com",
        "employee@email.com",
      ].includes(email)
    ) {
      user = {
        email: email,
        password: hashPassword("password", generateSalt()),
        role: getRole(email),
        fullname: "Gojo Satoru",
        id: 0,
        company_id: 0,
        contact_no: "99999999",
        position: "STORE MANAGER",
        status: "A",
        employment_details: {
          user_id: 0,
          user_company_id: 0,
          working_hours: 8,
          employment_type: "FULL-TIME",
        },
        profile_image:
          "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
        preferences: [],
      };
    } else {
      user = await prisma.user.findFirst({
        where: {
          email: email,
          status: USER_STATUS.ACTIVE,
        },
      });
    }

    if (user && checkPassword(password, user.password)) {
      const token = jwt.sign(
        { user_id: user.id, company_id: user.company_id, email: user.email, name: user.fullname, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d", // expires in 24 hours
        }
      );

      jwt.verify(token, process.env.JWT_SECRET);

      user.profile_image = user?.profile_image?.toString() as string;
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        user: userWithoutPassword,
        bearerToken: token,
      });
    } else {
      res.status(400).send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    let message = "Error encountered. Please try again later.";
    if (error instanceof ValidationError) {
      message = error.message;
    }
    res.status(400).send(message);
  }
});


app.post('/api/forget-password', async (req, res) => {
  try{
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        status: USER_STATUS.ACTIVE,
      },
    });

    if(user) {
      // generate token for password reset validation
      const token = generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, user.fullname, token);
    }

    res.status(200).json({data: "success"});
  } catch (error) {
    console.error(error);
    let message = "Error encountered. Please try again later.";
    if (error instanceof ValidationError) {
      message = error.message;
    }
    res.status(400).send(message);
  }
});

app.post("/api/reset-password", async (req, res) => {
  try{
    const { user, password: passwordB64, confirm_password: confirmPasswordB64 } = req.body;

    if (!user || !passwordB64 || !confirmPasswordB64) {
      throw new ValidationError("Missing required params.");
    }
    if(passwordB64 !== confirmPasswordB64) {
      throw new ValidationError("Passwords do not match.");
    }

    // decode password
    const newPassword = Buffer.from(passwordB64, "base64").toString();

    await prisma.user.update({
      where: {
        id_company_id: {
          id: user.id,
          company_id: user.company_id,
        },
        status: USER_STATUS.ACTIVE,
        email: user.email,
      },
      data: {
        password: hashPassword(newPassword, generateSalt()),
      },
    });

    res.status(200).json({data: "success"});
  } catch (error) {
    console.error(error);
    let message = "Error encountered. Please try again later.";
    if (error instanceof ValidationError) {
      message = error.message;
    }
    res.status(400).send(message);
  }
});


app.post("/api/reset-password/:token", async (req, res) => {
  try{
    const { token } = req.params;
    const decoded = verifyPasswordResetToken(token);

    const { email } = decoded as any;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        status: USER_STATUS.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        company_id: true,
      }
    });

    res.status(200).json({data: user});
  } catch (error) {
    console.error(error);
    let message = "Error encountered. Please try again later.";
    if (error instanceof jwt.TokenExpiredError) {
      message = "expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "invalid";
    }
    res.status(400).send(message);
  }
});


app.get("*", (req, res) => {
  // res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'))
  res.redirect(process.env.WEBPAGE_URL + "/");
});

const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: ${
    process.env.NODE_ENV !== "production"
      ? `http://localhost:${PORT}`
      : `https://simplymanaged-server.onrender.com`
  }
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
