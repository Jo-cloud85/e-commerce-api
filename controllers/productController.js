import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import CustomErrors from "../errors/index.js";
import path from "path";

// In ES6 module, you can only use __dirname this way
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProduct = async (req, res) => {
	// create user property on req.body and set it equal to userId (req.user)
	// note that the 'user' in req.body.user MUST match the Product model word 'user'
	// also, the req.user, and thus, the userId was set up in authentication.js middleware
	req.body.user = req.user.userId;
	const product = await Product.create(req.body);
	res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
	const products = await Product.find({});
	res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
	const { id: productId } = req.params;

	/* You can only populate the reviews when you have included virtuals in your ProductSchema. It allows 
	you to connect the product to the review. You dont have to do that in ReviewSchema because the 
	ReviewSchema model already has the products as one of its properties */
	const product = await Product.findOne({ _id: productId }).populate(
		"reviews"
	);
	if (!product) {
		throw new CustomErrors.NotFoundError(
			`No product with id : ${productId}`
		);
	}
	res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
	const { id: productId } = req.params;

	const product = await Product.findOneAndUpdate(
		{ _id: productId },
		req.body,
		{ new: true, runValidators: true }
	);
	if (!product) {
		throw new CustomErrors.NotFoundError(
			`No product with id : ${productId}`
		);
	}
	res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOne({ _id: productId });
	if (!product) {
		throw new CustomErrors.NotFoundError(
			`No product with id : ${productId}`
		);
	}
	await product.deleteOne(); //.remove() is not available for Mongoose v7
	res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

// This is the mtd w/o Cloudinary. You can also use the Cloudinary way
const uploadImage = async (req, res) => {
	// console.log(req.files);
	if (!req.files) {
		throw new CustomErrors.BadRequestError("No File Uploaded");
	}
	const productImage = req.files.image;

	if (!productImage.mimetype.startsWith("image")) {
		throw new CustomErrors.BadRequestError("Please Upload Image");
	}

	const maxSize = 1024 * 1024;

	if (productImage.size > maxSize) {
		throw new CustomErrors.BadRequestError(
			"Please upload image smaller than 1MB"
		);
	}

	const imagePath = path.join(
		__dirname,
		"../public/uploads/" + `${productImage.name}`
	);

	// rmb that  .mv is a function to move the file elsewhere on my server. It can take a
	// callback or return a promise
	await productImage.mv(imagePath);

	//fs.unlinkSync(req.files.image.tempFilePath)

	res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

export default {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
};
