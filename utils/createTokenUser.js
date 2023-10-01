/* The reason you want to do this is so that you can extract the name, userId and role only and pass it to authController later. You don't want the password to be involved in your payload in the jwt.js file */
const createTokenUser = (user) => {
	return { name: user.name, userId: user._id, role: user.role };
};

export default createTokenUser;
