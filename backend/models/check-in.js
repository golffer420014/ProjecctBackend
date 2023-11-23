const mongoose = require("mongoose");

const CheckInSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: "",
    },
    productName: {
      type: String,
      default: "",
    },
    province: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

CheckInSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

CheckInSchema.set("toJSON", {
  virtuals: true,
});

//สร้าง tabel Product โดยเรียกใช้ function productSchema
exports.CheckIn = mongoose.model("CheckIn", CheckInSchema);
