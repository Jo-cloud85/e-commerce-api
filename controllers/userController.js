import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

const getAllUsers = async (req, res) => {
	/* select mtd is to remove the password (note that there is a negative sign) because rmb, if we just
	get all the users, we'll get all the keys with the values but we don't want to see the password */
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

/* a function (and thus, a route) to quickly check if there is a user by authenticatingthe user, check if
if token is valid, grab the user properties that we get back from the cookie i.e. check what is the name,
the role etc so that right away you can show that on the frontend. 
Just think of you signing in to Shoppee, and once login, you can see on the homepage navbar, your name etc.
Note that it is not {user} but {user: req.user} else you will get password back which you dont want */
const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

// Method 1: update user with findOneAndUpdate
// const updateUser = async(req, res) => {
//     const { email, name } = req.body; //no need for password as there's a separate route for that already
//     if (!email || !name) {
//         throw new CustomErrors.BadRequestError('Please provide all values')
//     }

//     const user = await User.findOneAndUpdate(
//         { _id:req.user.userId },
//         { email, name },
//         { new:true, runValidators: true }
//     )

//     const tokenUser = Utils.createTokenUser(user)
//     Utils.jwtValidation.attachCookiesToResponse({res, user:tokenUser})

//     res.status(StatusCodes.OK).json({ user: tokenUser })
// }

// Method 2: update user with findOne and user.save()
/* The downside of using this method is that you will invoke the UserSchema.pre('save', ) hook which means 
that just updating the user causing the password to be re-hashed even though you didn't update the password. 
Thus, when you tried to login with the same password, you become unauthorized. You can solve this by 
ensuring that UserSchema.pre-hook checks for password changes first i.e. this line:
    if (!this.isModified('password')) return; */
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

	/* the save function invokes the async function in UserSchema.pre in model/User.js
    More explicitly, this is a mtd on a Mongoose document which is async so it returns a promise that
    you can await on. If you load an existing doc from the database and modify it, it updates the 
    existing doc aka user by inserting a new doc into the database.
    Of course, you can also use other ways like findOneAndUpdate(), this is just to show you another way*/
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
