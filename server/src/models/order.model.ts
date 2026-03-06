import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "Please enter shipping address"]
        },
        city: {
            type: String,
            required: [true, "Please enter city"]
        },
        state: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            required: [true, "Please enter phone number"]
        },
        country: {
            type: String,
            required: [true, "Please enter country"]
        },
    }, // <-- Added missing closing brace and comma here
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0.0,
    },
    tax: {
        type: Number,
        required: true,
    },
    shippingCharges: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered"],
        default: "Pending",
    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }
        }
    ],
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
