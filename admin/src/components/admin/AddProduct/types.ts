// admin/src/components/admin/AddProduct/types.ts
export interface ProductFormData {
  name: string;
  categories: string[];
  subcategories: string[];
  brand: string;
  description: string;
  stock: number;
  price: number;
  discount: number;
  status: boolean;
  featured: boolean;
}

export interface Category {
  _id: string;
  name: string;
  value: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  value: string;
  parentCategory: {
    _id: string;
    name: string;
  };
}

export interface Brand {
  _id: string;
  name: string;
}

export interface ProductFormProps {
  formData: ProductFormData;
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  photoPreviews: string[];
  isLoading: boolean;
  categoriesLoading: boolean;
  subcategoriesLoading: boolean;
  brandsLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (selectedCategories: string[]) => void;
  onSubcategoryChange: (selectedSubcategories: string[]) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (status: boolean) => void; // Added status handler
  onFeaturedChange: (featured: boolean) => void; // Added featured handler
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export interface PhotoGalleryProps {
  photoPreviews: string[];
  mainPhotoIndex: number;
  onSetAsMain: (index: number) => void;
  onRemovePhoto: (index: number) => void;
}

export interface MainPhotoDisplayProps {
  photoPreview: string;
}