import { Router } from "express";
import controllerProduct from "../controllers/productController.js";
import controllerReview from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authentication.js";

const router = Router();

router
	.route("/")
	.post(
		[
			authMiddleware.authenticateUser,
			authMiddleware.authorizePermissions("admin"),
		],
		controllerProduct.createProduct
	)
	.get(controllerProduct.getAllProducts);

router //must come before /:id route
	.route("/uploadImage")
	.post(
		[
			authMiddleware.authenticateUser,
			authMiddleware.authorizePermissions("admin"),
		],
		controllerProduct.uploadImage
	);

router
	.route("/:id")
	.get(controllerProduct.getSingleProduct)
	.patch(
		[
			authMiddleware.authenticateUser,
			authMiddleware.authorizePermissions("admin"),
		],
		controllerProduct.updateProduct
	)
	.delete(
		[
			authMiddleware.authenticateUser,
			authMiddleware.authorizePermissions("admin"),
		],
		controllerProduct.deleteProduct
	);

/* This is part of the alternative solution to getSingleReview in reviewController.js if I don't want to use
.populate() in getSingleProduct in productController.js to get reviews (and as a result, having to use virtuals 
in productSchema to access the reviews property for each product). The id here is the product Id. */
router.route("/:id/reviews").get(controllerReview.getSingleProductReviews);

export default router;
