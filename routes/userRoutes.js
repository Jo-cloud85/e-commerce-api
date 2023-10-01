import { Router } from "express";
import controllerUser from "../controllers/userController.js";
import authMiddleware from "../middleware/authentication.js";

const router = Router();

router.route("/").get(
	authMiddleware.authenticateUser,
	authMiddleware.authorizePermissions("admin"), // you can add more than 1 role
	controllerUser.getAllUsers
);

// if you place this route below /:id, /showMe will be treated as an id
router
	.route("/showMe")
	.get(authMiddleware.authenticateUser, controllerUser.showCurrentUser);

router
	.route("/updateUser")
	.patch(authMiddleware.authenticateUser, controllerUser.updateUser);

router
	.route("/updateUserPassword")
	.patch(authMiddleware.authenticateUser, controllerUser.updateUserPassword);

// id route must be the last one
router
	.route("/:id")
	.get(authMiddleware.authenticateUser, controllerUser.getSingleUser);

export default router;
