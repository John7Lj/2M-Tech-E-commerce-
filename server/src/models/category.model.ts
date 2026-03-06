import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  value: string; // URL-friendly version (e.g., 'hard-disk')
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  value: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Category value must contain only lowercase letters, numbers, and hyphens']
    // Removed required: true to avoid validation before pre-save middleware
  },

  image: {
    type: String,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create URL-friendly value from name - Fixed to run before validation
categorySchema.pre('validate', function (next) {
  if (this.name && (!this.value || this.isModified('name'))) {
    this.value = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim();
  }
  next();
});

// Add index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);