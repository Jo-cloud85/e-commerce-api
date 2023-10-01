import CustomErrors from "../errors/index.js";

const checkPermissions = (requestUser, resourceUserId) => {
	// console.log(requestUser);
	// console.log(resourceUserId); //resourceUserId comes as an object, thus you need toString()

	if (requestUser.role === "admin") return;
	if (requestUser.userId === resourceUserId.toString()) return;

	throw new CustomErrors.UnauthorizedError(
		"Not authorized to access this route"
	);
};

export default checkPermissions;
