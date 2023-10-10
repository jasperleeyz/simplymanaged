import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

import { routes } from "./routes/index";
import { checkPassword, generateSalt, hashPassword } from "./utils/security";
import { sendApprovedEmail, sendRegistrationEmail, sendRejectedEmail } from "./utils/email";
import { USER_STATUS } from "./utils/constants";

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

app.post(`/api/login`, async (req, res) => {
  console.info("In " + req.path);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Both email and password are required");
      throw new Error("Both email and password are required");
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
        { company_id: user.company_id, email: user.email, name: user.fullname, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d", // expires in 24 hours
        }
      );

      jwt.verify(token, process.env.JWT_SECRET);

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
  }
});

// app.post(`/post`, async (req, res) => {
//   const { title, content, authorEmail } = req.body
//   const result = await prisma.post.create({
//     data: {
//       title,
//       content,
//       author: { connect: { email: authorEmail } },
//     },
//   })
//   res.json(result)
// })

// app.put('/post/:id/views', async (req, res) => {
//   const { id } = req.params

//   try {
//     const post = await prisma.post.update({
//       where: { id: Number(id) },
//       data: {
//         viewCount: {
//           increment: 1,
//         },
//       },
//     })

//     res.json(post)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.put('/publish/:id', async (req, res) => {
//   const { id } = req.params

//   try {
//     const postData = await prisma.post.findUnique({
//       where: { id: Number(id) },
//       select: {
//         published: true,
//       },
//     })

//     const updatedPost = await prisma.post.update({
//       where: { id: Number(id) || undefined },
//       data: { published: !postData?.published },
//     })
//     res.json(updatedPost)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.delete(`/post/:id`, async (req, res) => {
//   const { id } = req.params
//   const post = await prisma.post.delete({
//     where: {
//       id: Number(id),
//     },
//   })
//   res.json(post)
// })

// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.json(users)
// })

// app.get('/user/:id/drafts', async (req, res) => {
//   const { id } = req.params

//   const drafts = await prisma.user
//     .findUnique({
//       where: {
//         id: Number(id),
//       },
//     })
//     .posts({
//       where: { published: false },
//     })

//   res.json(drafts)
// })

// app.get(`/post/:id`, async (req, res) => {
//   const { id }: { id?: string } = req.params

//   const post = await prisma.post.findUnique({
//     where: { id: Number(id) },
//   })
//   res.json(post)
// })

// app.get('/feed', async (req, res) => {
//   const { searchString, skip, take, orderBy } = req.query

//   const or: Prisma.PostWhereInput = searchString
//     ? {
//         OR: [
//           { title: { contains: searchString as string } },
//           { content: { contains: searchString as string } },
//         ],
//       }
//     : {}

//   const posts = await prisma.post.findMany({
//     where: {
//       published: true,
//       ...or,
//     },
//     include: { author: true },
//     take: Number(take) || undefined,
//     skip: Number(skip) || undefined,
//     orderBy: {
//       updatedAt: orderBy as Prisma.SortOrder,
//     },
//   })

//   res.json(posts)
// })

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
