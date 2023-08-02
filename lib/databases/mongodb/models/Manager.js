const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerSchema = new Schema(
	{
		name: String,
		mobile: String,
		email: String,
		password: String,
		salt: String,
		status: {
			type: Boolean,
			default: true,
		},
		avatar: {
			type: Array,
			default: [],
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("managers", ManagerSchema);
