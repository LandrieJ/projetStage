const express = require('express');
const userRouter = express.Router();
const { getUsers, getUser, updateUser, addUser, deleteUser } = require('../controller/user.controller');
const isAdmin = require('../middleware/admin');
// const isAuthenticated = require('../middleware/auth');
const { getTotalUser } = require('../controller/materiel.controller');

userRouter.get("/", isAdmin, getUsers);
userRouter.get("/:id?", isAdmin, getUser);
userRouter.post("/", isAdmin, addUser);
userRouter.put("/:id?", isAdmin, updateUser);
userRouter.delete("/:id?", isAdmin, deleteUser);
userRouter.get("/total", isAdmin, getTotalUser);

module.exports = userRouter;