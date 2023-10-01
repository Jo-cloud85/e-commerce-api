import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

const getAllUsers = async (req, res) => {
	const users = await User.find({ role: "user" }).select("-password");
	res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
	const user = await User.findOne({ _id: req.params.id }).select("-password");
	if (!user) {
		throw new CustomErrors.NotFoundError(
			`No user with id : ${req.params.id}`
		);
	}
	Utils.checkPermissions(req.user, user._id);
	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with findOne and user.save()
const updateUser = async (req, res) => {
	const { email, name } = req.body;
	if (!email || !name) {
		throw new CustomErrors.BadRequestError("Please provide all values");
	}

	const user = await User.findOne({ _id: req.user.userId });

	// this is for updating the user properties
	user.email = email;
	user.name = name;

	await user.save();

	const tokenUser = Utils.createTokenUser(user);
	Utils.jwtValidation.attachCookiesToResponse({ res, user: tokenUser });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new CustomErrors.BadRequestError("Please provide both values");
	}

	const user = await User.findOne({ _id: req.user.userId });

	const isPasswordCorrect = await user.comparePassword(oldPassword);
	if (!isPasswordCorrect) {
		throw new CustomErrors.UnauthenticatedError("Invalid Credentials");
	}

	user.password = newPassword;

	await user.save();

	res.status(StatusCodes.OK).json({ msg: "Success! Password updated!" });
};

export default {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
};
