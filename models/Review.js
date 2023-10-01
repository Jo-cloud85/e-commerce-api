import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: [true, "Please provide rating"],
		},
		title: {
			type: String,
			trim: true,
			required: [true, "Please provide review title"],
			maxLength: [50, "Title cannot be more than 50 characters"],
		},
		comment: {
			type: String,
			required: [true, "Please provide review comment"],
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: mongoose.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	},
	{ timestamps: true }
);

// this ensures that the user can ONLY submit 1 review per product
// as the reviews is dependent on BOTH product and user, you have to do this way instead of
// stating 'unique: true' in respective product and user fields in the ReviewSchema model above
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

/* You don't use .methods here as you want to call in on the schema and not the instance - .methods is only
use on instance. For example, we create an instance called user under login function in authController.js
then we can use the .methods in the UserSchema to create the comparePassword method (UserSchema.methods.comparePassword) in which then the user in authController.js can use.

Here, since we want to call in on the schema, we use .statics instead, then create the function we want, 
which in this case, its calculateAverageRating. 
And in order to call this ReviewSchema.statics.calculateAverageRating method, under the post- hook, you got 
to invoke it like this - await this.constructor.calculateAverageRating(this.product);  */

ReviewSchema.statics.calculateAverageRating = async function (productId) {
	const result = await this.aggregate([
		{ $match: { product: productId } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				numOfReviews: { $sum: 1 },
			},
		},
	]);

	// If I delete a product, this array below will be empty
	console.log(result); // you get sth like [{_id:null, averageRating: 4, numOfReviews: 2}]

	try {
		await this.model("Product").findOneAndUpdate(
			{ _id: productId },
			{
				averageRating: Math.ceil(result[0]?.averageRating || 0),
				numOfReviews: result[0]?.numOfReviews || 0,
			}
		);
	} catch (error) {
		console.log(error);
	}
};

/* Rmb, whenever you use pre- or post- hooks like below, you need to use .save() or .deleteOne() in your 
controller.js to trigger these hooks */

ReviewSchema.post("save", async function () {
	// console.log('post save hook called');
	await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post(
	"deleteOne",
	{ document: true, query: false },
	async function () {
		// console.log('post deleteOne hook called');
		await this.constructor.calculateAverageRating(this.product);
	}
);

export default mongoose.model("Review", ReviewSchema);
