import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    _id: string;
    companyName: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    description: string;
    // SEO Metadata
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    // Social Media
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
    // Other Settings
    timezone: string;
    language: string;
    // Timestamps
    updatedAt: Date;
    createdAt: Date;
}

const SettingsSchema: Schema = new Schema({
    companyName: {
        type: String,
        required: [true, 'Please enter company name'],
        default: 'My Company'
    },
    logo: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    // SEO Metadata
    metaTitle: {
        type: String,
        default: 'My E-commerce Store'
    },
    metaDescription: {
        type: String,
        default: 'Best products at affordable prices'
    },
    metaKeywords: {
        type: String,
        default: 'ecommerce, online store, products'
    },
    // Social Media
    facebook: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    whatsapp: {
        type: String,
        default: ''
    },

    timezone: {
        type: String,
        default: 'UTC'
    },
    language: {
        type: String,
        default: 'en'
    },


}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);