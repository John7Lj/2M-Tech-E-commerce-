import { Category } from "../models/category.model";

export class CategoryService {
    /**
     * Normalize category name for consistent storage and comparison
     */
    static normalizeCategoryName(categoryName: string): string {
        return categoryName.toLowerCase().trim();
    }

    /**
     * Find matching category in database with flexible matching
     */
    static async findMatchingCategory(inputCategory: string) {
        const normalizedInput = this.normalizeCategoryName(inputCategory);

        // Try exact match first
        let category = await Category.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${normalizedInput}$`, 'i') } },
                { value: normalizedInput }
            ],
            isActive: true
        });

        // If no exact match, try partial match
        if (!category) {
            category = await Category.findOne({
                $or: [
                    { name: { $regex: normalizedInput, $options: 'i' } },
                    { value: { $regex: normalizedInput, $options: 'i' } }
                ],
                isActive: true
            });
        }

        return category;
    }

    /**
     * Validate category exists and return normalized value
     */
    static async validateAndNormalizeCategory(category: string): Promise<string> {
        const matchingCategory = await this.findMatchingCategory(category);

        if (!matchingCategory) {
            return this.normalizeCategoryName(category);
        }

        return matchingCategory.value;
    }

    /**
     * Get all active categories
     */
    static async getActiveCategories() {
        return await Category.find({ isActive: true }).select('name value');
    }
}