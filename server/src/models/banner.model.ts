// server/src/models/banner.model.ts
import mongoose from "mongoose";

export interface IBannerProduct {
  product: mongoose.Types.ObjectId;
  discountPercentage: number;
  originalDiscount: number; // Product's discount before the banner was applied
}

export interface IBanner {
  _id?: string;
  name: string;
  description: string;
  image: string;
  imagePublicId: string;
  products: IBannerProduct[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const bannerProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  originalDiscount: {
    type: Number,
    default: 0 // Stores the product's discount before this banner was applied
  }
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Banner name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Banner description is required"],
    trim: true
  },
  image: {
    type: String,
    required: [true, "Banner image is required"]
  },
  imagePublicId: {
    type: String,
    required: true
  },
  products: [bannerProductSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);