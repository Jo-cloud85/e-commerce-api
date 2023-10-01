import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

// you need next as you you to pass the output to the next middleware which is the getAllUsers route
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

/* the reason why its (...roles) is because you can specify more than 1 role to authorize permissions and 
instead of the usual where we are getting the reference of the function and then we invoke it when we hit 
the route, in the case, we are letting the routes to directly invoke this function - we striaghtaway invoke 
it right when the application starts. We let this function return a callback function because of Express 
requirements for a callback. */
const authorizePermissions = (...roles) => {
	/* when we return a callback here, in the userRoutes.js file, this authorizePermissions function will 
    be used as a callback for Express */
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
