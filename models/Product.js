import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, "Please provide product name"],
			maxlength: [100, "Name cannot be more than 100 characters"],
		},
		price: {
			type: Number,
			required: [true, "Please provide product price"],
			default: 0,
		},
		description: {
			type: String,
			required: [true, "Please provide product description"],
			maxlength: [
				1000,
				"Description cannot be more than 1000 characters",
			],
		},
		image: {
			type: String,
			default: "/uploads/example.jpeg",
		},
		category: {
			type: String,
			required: [true, "Please provide product category"],
			enum: ["office", "kitchen", "bedroom"],
		},
		company: {
			type: String,
			required: [true, "Please provide company"],
			enum: {
				values: ["ikea", "liddy", "marcos"],
				message: "{VALUE} is not supported",
			},
		},
		colors: {
			type: [String],
			default: ["#222"],
			required: true,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		freeShipping: {
			type: Boolean,
			default: false,
		},
		inventory: {
			type: Number,
			required: true,
			default: 15,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		numOfReviews: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

/* One thing about virtuals is that you can't query the data - so in reviewController or productController,
when you use .populate(), you cannot query the data inside this populate because it is a virtual property */
ProductSchema.virtual("reviews", {
	ref: "Review", // pointing to the Schema model thats why uppercase
	localField: "_id",
	foreignField: "product", // this is the field in the Review
	justOne: false, // because you want the whole list of reviews
	// match: {rating: 5}
});

/* This step is necessary because when you (or the admin) delete a product, the reviews by right should be 
deleted as well. So you need to 'connect' product and its reviews */
ProductSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function () {
		await this.model("Review").deleteMany({ product: this._id });
	}
);

export default mongoose.model("Product", ProductSchema);
