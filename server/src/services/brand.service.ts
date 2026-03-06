import { Brand } from "../models/brand.model";
import { escapeRegex } from "../utils/helper";

export class BrandService {
    /**
     * Find brand by name with case-insensitive exact matching
     */
    static async findBrandByName(name: string) {
        if (!name) return null;
        return await Brand.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') }
        });
    }

    /**
     * Check if a brand exists with a different ID (for updates)
     */
    static async existsOtherThan(name: string, id: string) {
        if (!name) return false;
        return await Brand.exists({
            name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') },
            _id: { $ne: id }
        });
    }
}
