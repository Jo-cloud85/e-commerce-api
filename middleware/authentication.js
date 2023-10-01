import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

const authenticateUser = async (req, res, next) => {
	// console.log(req);
	const token = req.signedCookies.token; //signedCookies is the name I gave to my cookie

	if (!token) {
		throw new CustomErrors.UnauthenticatedError("Authentication Invalid");
	}

	try {
		const { name, userId, role } = Utils.jwtValidation.isTokenValid({
			token,
		});
		// console.log(payload); //{ name, userId, role } is the payload
		req.user = { name, userId, role };
		next();
	} catch (error) {
		throw new CustomErrors.UnauthenticatedError("Authentication Invalid");
	}
};

const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomErrors.UnauthorizedError(
				"Unauthorized to access this route"
			);
		}
		next();
	};
};

export default {
	authenticateUser,
	authorizePermissions,
};
