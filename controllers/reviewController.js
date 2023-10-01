import Review from "../models/Review.js";
import Product from "../models/Product.js";

import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import Utils from "../utils/index.js";

const createReview = async (req, res) => {
	const { product: productId } = req.body;

	const isValidProduct = await Product.findOne({ _id: productId });
	if (!isValidProduct) {
		throw new CustomErrors.NotFoundError(
			`No product with id : ${productId}`
		);
	}

	const alreadySubmitted = await Review.findOne({
		product: productId,
		user: req.user.userId, // you can destructure and get it from req.body
	});
	if (alreadySubmitted) {
		throw new CustomErrors.BadRequestError(
			"Already submitted review for this product"
		);
	}

	req.body.user = req.user.userId;
	const review = await Review.create(req.body);
	res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
	// populate mtd allows us to reference documents in other collections so that we can get
	// specific info about the product when requesting all reviews
	const reviews = await Review.find({}).populate({
		path: "product", // this is what you want to reference to
		select: "name company price", // where you state the properties u want to get
	});
	// .populate({
	// 	// note that you can add more than 1 populate like this but in this case not necessary
	// 	path: "user", // this is what you want to reference to
	// 	select: "name", // where you state the properties u want to get
	// });
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params;

	const review = await Review.findOne({ _id: reviewId }); //you can also add populate here if you want
	if (!review) {
		throw new CustomErrors.NotFoundError(`No review with id ${reviewId}`);
	}
	res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const { rating, title, comment } = req.body;

	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new CustomErrors.NotFoundError(`No review with id ${reviewId}`);
	}

	Utils.checkPermissions(req.user, review.user);

	// this is for updating the review properties
	review.rating = rating;
	review.title = title;
	review.comment = comment;

	await review.save();
	res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params;

	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new CustomErrors.NotFoundError(`No review with id ${reviewId}`);
	}

	Utils.checkPermissions(req.user, review.user);
	await review.deleteOne({ _id: reviewId }); //.remove() is not available for Mongoose v7
	res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
};

/* this is an alternative mtd to getSingleReview if you want to access to reviews property w/o using
.populate() in getSingleProduct in productController.js */
const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId });
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export default {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
};
