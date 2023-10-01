import CustomErrors from '../errors/index.js';
import Utils from '../utils/index.js';

const authenticateUser = async (req, res, next) => {
    let token;
    // check header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
    // check cookies
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        throw new CustomErrors.UnauthenticatedError('Authentication invalid');
    }

    try {
        const payload = Utils.jwtValidation.isTokenValid(token);

        // Attach the user and his permissions to the req object
        req.user = {
            userId: payload.user.userId,
            role: payload.user.role,
        };

        next();
    } catch (error) {
        throw new CustomErrors.UnauthenticatedError('Authentication invalid');
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomErrors.UnauthorizedError(
                'Unauthorized to access this route'
            );
        }
        next();
    };
};

export default { authenticateUser, authorizeRoles };