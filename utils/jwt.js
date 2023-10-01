import jwt from "jsonwebtoken";

// As a recap, payload just refers to what we will be sending
const createJWT = ({ payload }) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_LIFETIME,
	});
	return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

// attaching cookies to our JWT in our response to the server
// as for the accessing of cookies on the server, we need cookieParser which is in app.js
const attachCookiesToResponse = ({ res, user }) => {
	const token = createJWT({ payload: user });

	const oneDay = 1000 * 60 * 60 * 24;

	// NODE.ENV is the environment variable
	// If it is equals to "production", then true i.e. we can send over HTTPS
	// If it is equals to "development", then false i.e. we cant send over HTTPS
	res.cookie("token", token, {
		httpOnly: true,
		expires: new Date(Date.now() + oneDay),
		secure: process.env.NODE_ENV === "production",
		signed: true,
	});

	//res.status(201).json({ user })
};

export default { createJWT, isTokenValid, attachCookiesToResponse };

/*
In the previous project, the Jobs API, we sent our token via response and then in the front end, it was 
stored in the local storage. And with the next request, we were attaching the JWT to our requests.

Now, with cookies, it works a little bit differently. We will take a look at proper auth workflow 
instead of storing token in localStorage. 

In this project, we learnt about storing the token in the cookies - you will see a refresh token and 
access token in the cookies tab under Storage in the dev tools. This cookie is http-only which means that 
it can be only accessed by the browser and on the next request browser will send that cookie for us.

Basically, instead of sending back the token with our response and then front end storing this in local 
storage, now we'll attach a cookie to our response and we'll store the JWT right in there.

FYI, we can only send back the cookies to the same domain where we get it from e.g. if it is from 
localhost:3000 then you must send back to localhost:3000. However, we know that sometimes the frontend is
hosted on a different domain so what you do is in package.json, write "proxy": "http://localhost:5000" 
which in this case is where the server is, in order to direct the cookies there
*/
