"use strict";

const express = require("express");
const config = require("../../config");
const { authenticate } = require("../../middleware");
const { uploadAvatar } = require("../../middleware/upload");
const {
  scriptPassword,
  comparePassword,
  genToken,
} = require("../../services/auth");
const {
  createUser,
  getUserByEmail,
  getUserById,
  storageAvatar,
  getMovieHistoryByUser,
  getAllUser,
  checkNullUserId,
  updateUserbyId,
  deleteUserById,
} = require("../../services/users");

const userRouter = express.Router();
userRouter.get("/", async (req, res) => {
  const { current, pageSize, search } = req?.query;

  return await getAllUser({ current, pageSize, search })
    .then((users) => {
      if (!users) {
        return res.status(500).send("Cannot get users list");
      }
      const {
        lastName = "",
        firstName = "",
        email = "",
        birthday = "",
        phoneNumber = "",
        role = "",
      } = users.result;
      const result = {
        totalPages: users?.pages,
        totalCount: users?.count,
        items: {
          lastName,
          firstName,
          email,
          birthday,
          phoneNumber,
          role: role?.description,
        },
      };
      return res.send(result);
    })
    .catch((err) => {
      if (!err || err == {}) {
        return res.status(500).send("Cannot get users list");
      }
      return res.status(500).send(err);
    });
});
//lấy detail
userRouter.get(`/detail`, async (req, res) => {
  const { id } = req.query;
  const userDetail = await getUserById(id);
  if (!userDetail) {
    return res.status(500).send(`User ${id} is not exist`);
  }
  return res.status(201).send(userDetail);
});

//cập nhật thông tin user
userRouter.put(`/:id`, async (req, res) => {
  const { lastName, firstName, email, birthday, phoneNumber, password } =
    req?.body;
  const { id = "" } = req?.params;
  const isExistUser = await checkNullUserId(id);
  if (!isExistUser) {
    return res.status(404).send(`User ${id} is not exist`);
  }
  if (!firstName || !lastName || !email) {
    return await res
      .status(400)
      .send("error: must field firstName, last name and email");
  }
  return await updateUserbyId(id, {
    firstName,
    lastName,
    birthday,
    email,
    phoneNumber,
    password: scriptPassword(password),
  })
    .then((result) => {
      return res.status(201).send(req?.body);
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
});

userRouter.post("/sign-up", async (req, res) => {
  const { firstName, lastName, email, birthday, password, phoneNumber } =
    req?.body;
  if (!email || !email.trim() || !password || !password.trim()) {
    return await res.status(400).send("error: must field email or pass");
  }
  return await getUserByEmail(email)
    .then(async (user) => {
      if (user) {
        return res.status(400).send(`Email ${email} is already exist`);
      }
      return await createUser(
        {
          firstName,
          lastName,
          email,
          birthday,
          password: scriptPassword(password),
          phoneNumber,
        },
        "user"
      )
        .then((response) => {
          if (!response.password) {
            return res.status(500).send(response);
          }
          const result = { ...response };
          delete result.password;
          return res.status(201).send(response);
        })
        .catch((err) => {
          return res.status(500).send(err);
        });
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
});

userRouter.post("/sign-in", async (req, res) => {
  const { email, password } = req?.body;
  //check valid data input
  if (!email) {
    return res.status(400).send(`Please fill Email`);
  } else if (!password) {
    return res.status(400).send(`Please fill password`);
  }
  //
  const user = await getUserByEmail(email);
  console.log({ user });
  if (!user) {
    return res.status(400).send(`Email ${email} is not exist`);
  }
  const isMatchPassword = comparePassword(password, user.password);
  if (!isMatchPassword) {
    return res.status(400).send("Password is not correct");
  }
  const token = genToken({ id: user.id });
  return res.status(200).send({ user, token });
});
const path = "public/images/avatar";
userRouter.post(
  "/avatar",
  [authenticate, uploadAvatar(path)],
  async (req, res) => {
    const { file, user } = req;
    const url = `${config.SYSTEMS.HOST}${config.SYSTEMS.PORT}/${file?.path}`;
    const storeAvatar = await storageAvatar(user.id, url);
    return res.status(200).send(storeAvatar);
  }
);

//lấy danh sách phim mà user đã xem
userRouter.get("/history", [authenticate], async (req, res) => {
  const { user } = req;
  // chỗ này user đc lấy từ sequelize nên chỉ cần tạo cái alias bên models, thì có thể get movie đc
  // const data = await user.getMovies()
  //còn đây là cách truyền thống
  console.log(user.id, "user.id");
  return await getMovieHistoryByUser(user.id)
    .then((result) => {
      console.log({ result });
      return res.status(200).send(result);
    })
    .catch((err) => {
      return res.status(500).send("cannot get history");
    });
});

//lấy thông tin tài khoản
userRouter.get("/profile", [authenticate], async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(500).send("cannot get user, please login again");
  }
  return res.status(200).send(user);
});

//delete
userRouter.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  const isExistUser = await checkNullUserId(id);
  // check user is exist by id
  if (!isExistUser) {
    return res.status(404).send(`User ${id} is not exist`);
  }
  const userDeleted = await deleteUserById(id);
  if (!userDeleted) {
    return res.status(500).send(`user ${id} cannot delete`);
  }
  return res.status(201).send(`Delete user ${id} success`);
});

module.exports = userRouter;
