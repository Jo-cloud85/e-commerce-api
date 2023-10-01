import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

const register = async (req, res) => {
	const { email, name, password } = req.body;

	const emailAlreadyExists = await User.findOne({ email });
	if (emailAlreadyExists) {
		throw new CustomErrors.BadRequestError("Email already exists");
	}

	// first registered user is an admin
	const isFirstAccount = (await User.countDocuments({})) === 0;
	const role = isFirstAccount ? "admin" : "user";

	const user = await User.create({ email, name, password, role });
	// set up tokenUser instead of using user directly to omit the password in my payload
	const tokenUser = Utils.createTokenUser(user);
	Utils.jwtValidation.attachCookiesToResponse({ res, user: tokenUser });

	res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new CustomErrors.BadRequestError(
			"Please provide email and password"
		);
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomErrors.UnauthenticatedError("Invalid credentials");
	}

	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new CustomErrors.UnauthenticatedError("Invalid Credentials");
	}

	const tokenUser = Utils.createTokenUser(user);
	Utils.jwtValidation.attachCookiesToResponse({ res, user: tokenUser });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
	// just to remove the cookie when log out
	res.cookie("token", "logout", {
		httpOnly: true,
		expires: new Date(Date.now()), //expires must be small, either Date.now() or like 10 secs
	});
	res.status(StatusCodes.OK).json({ msg: "user logged out!" }); //msg is just for testing as frontend will have its own msg
};

export default { register, login, logout };
