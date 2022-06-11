"use strict";
const { Avatar, User, Movie } = require("../../models");
const { Op } = require("sequelize");

const getAllUser = async ({ current, pageSize, search }) => {
  return await User.findAndCountAll()
    .then((data) => {
      let page = current && current > 0 ? parseInt(current) - 1 : 0;
      let limit = pageSize && pageSize > 0 ? parseInt(pageSize) : data.count;
      const offset = page * limit;
      let pages = Math.ceil(data.count / limit);
      return User.findAll({
        attributes: [
          "id",
          "lastName",
          "firstName",
          "email",
          "birthday",
          "phoneNumber",
          "role",
        ],
        limit,
        offset,
        where: { firstName: { [Op.like]: `%${search}%` } },
      })
        .then((res) => ({ result: res, count: data.count, pages }))
        .catch((userFindAllError) => {
          console.log({ userFindAllError });
          return null;
        });
    })
    .catch((userFindAndCountAllError) => {
      console.log({ userFindAndCountAllError });
      return null;
    });
};

const createUser = async (user) => {
  try {
    const newUser = await User.create(user);
    return newUser;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserByEmail = async (email) => {
  try {
    //sẽ lụm thằng đầu tiên theo index
    const user = await User.findOne({
      where: {
        email,
      },
      include: [
        {
          model: Avatar,
          as: "avatar",
          // where: {
          //   isActive: true
          // }
        },
        {
          model: Avatar,
          as: "avatars",
        },
      ],
    });
    return user;
  } catch (error) {
    return console.log(error, "err");
  }
};

const getUserById = async (id) => {
  return await User.findOne({
    where: {
      id,
    },
  })
    .then((user) => {
      console.log({ user });
      return user;
    })
    .catch((error) => {
      return console.log(error, "err nè");
    });
};
const checkNullUserId = async (id) => {
  try {
    const user = await User.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

const updateUserbyId = async (id, data) => {
  return await User.update(data, {
    where: {
      id,
    },
  })
    .then((user) => {
      return user;
    })
    .catch((error) => {
      return null;
    });
};

const storageAvatar = async (userId, url) => {
  try {
    const avatar = await Avatar.create({ url, userId, isActive: true });
    await Avatar.update(
      { isActive: false },
      {
        where: {
          userId,
          id: {
            //nghĩa là loại trừ avatar id đó ra thôi
            //theo script thì sẽ là
            //where userId = 3 AND id not is 7
            [Op.not]: avatar?.id,
          },
        },
      }
    );
    return avatar;
  } catch (error) {
    console.log(error, "storeAvatar");
    return null;
  }
};

const getMovieHistoryByUser = async (userId) => {
  return await User.findOne({
    where: {
      id: userId,
    },
    include: [
      {
        model: Movie,
        as: "movies",
        where: {
          [Op.not]: 1,
        },
      },
    ],
  })
    .then((res) => res)
    .catch((err) => {
      console.log(err);
      return null;
    });
};
const deleteUserById = async (id) => {
  try {
    const user = await User.destroy({
      where: {
        id,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};
module.exports = {
  createUser,
  getUserByEmail,
  checkNullUserId,
  getUserById,
  getAllUser,
  storageAvatar,
  updateUserbyId,
  getMovieHistoryByUser,
  getAllUser,
  deleteUserById,
};
