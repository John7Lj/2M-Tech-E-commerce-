import { Product } from "../models/product.model";
import { OrderItemType } from "../types/types";

export const reduceStock = async (orderItems: OrderItemType[]) => {
    const bulkOps = orderItems.map(item => ({
        updateOne: {
            filter: { _id: item.productId, stock: { $gte: item.quantity } },
            update: { $inc: { stock: -item.quantity } }
        }
    }));

    const result = await Product.bulkWrite(bulkOps);

    if (result.modifiedCount < orderItems.length) {
        throw new Error('Insufficient stock for one or more products or product not found');
    }
};

export const increaseStock = async (orderItems: OrderItemType[]) => {
    const bulkOps = orderItems.map(item => ({
        updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: item.quantity } }
        }
    }));

    await Product.bulkWrite(bulkOps);
};