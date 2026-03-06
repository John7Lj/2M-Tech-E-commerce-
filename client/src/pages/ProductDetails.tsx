import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Share2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import BackButton from '../components/common/BackBtn';
import { useProductDetailsQuery } from '../redux/api/product.api';
import { addToCart, decrementCartItem, incrementCartItem } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { wysiwygStyles, ProductSkeleton } from '../components/common/filesRelatedProductDetails';
import RelatedProducts from '../components/RelatedProducts';
import { useConstants } from '../hooks/useConstants';

const ErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
    <div className="container mx-auto p-4 my-6">
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-950 rounded-[3rem] border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Something went wrong</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Unable to load product details. Please try again.</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                >
                    Try Again
                </button>
            )}
        </div>
    </div>
);

const StockIndicator: React.FC<{ stock: number }> = ({ stock }) => {
    const getStockStatus = () => {
        if (stock <= 0) return { text: 'Out of stock', color: 'text-red-500', bg: 'bg-red-500/10' };
        if (stock <= 10) return { text: `${stock} Items Left`, color: 'text-orange-500', bg: 'bg-orange-500/10' };
        return { text: 'In stock', color: 'text-primary', bg: 'bg-primary/10' };
    };

    const status = getStockStatus();

    return (
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color} ${status.bg} border border-current/10`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${stock > 0 ? 'bg-current' : 'bg-red-500'}`}></div>
            {status.text}
        </div>
    );
};

const PriceDisplay: React.FC<{
    originalPrice: number;
    netPrice: number;
    discount: number;
    currencySymbol?: string;
}> = ({ originalPrice, netPrice, discount, currencySymbol = 'LE' }) => {
    const hasDiscount = discount > 0;
    const finalPrice = netPrice || (originalPrice - (originalPrice * discount / 100));
    const savingsAmount = originalPrice - finalPrice;

    if (hasDiscount) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <span className="text-4xl font-black text-primary tracking-tighter">
                        {currencySymbol} {finalPrice.toLocaleString()}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400 line-through font-bold">
                            {currencySymbol} {originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                            Save {currencySymbol}{savingsAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="inline-block bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    {discount}% OFF
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                {currencySymbol} {finalPrice.toLocaleString()}
            </span>
        </div>
    );
};

const ProductInfoSection: React.FC<{ product: any }> = ({ product }) => {
    const brandName = typeof product.brand === 'object' ? product.brand.name : product.brand;
    const categoryName = product.categories && product.categories.length > 0
        ? (typeof product.categories[0] === 'object' ? product.categories[0].name : product.categories[0])
        : null;

    return (
        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            {categoryName && (
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Category</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{categoryName}</span>
                </div>
            )}
            {brandName && (
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Brand</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{brandName}</span>
                </div>
            )}
            <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Warranty</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase">12 Months</span>
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Shipping</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase">Fast Delivery</span>
            </div>
        </div>
    );
};

const ProductDescription: React.FC<{ description: string }> = ({ description }) => {
    return (
        <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 transition-colors">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center space-x-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <span>Product Description</span>
            </h3>
            {!description ? (
                <p className="text-gray-400 italic">No description available for this product.</p>
            ) : (
                <div
                    className="wysiwyg-content prose prose-red dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </div>
    );
};

const QuantitySelector: React.FC<{
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    maxStock: number;
}> = ({ quantity, onIncrement, onDecrement, maxStock }) => (
    <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800">
        <button
            onClick={onDecrement}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-30"
            disabled={quantity <= 1}
        >
            −
        </button>
        <span className="mx-6 text-sm font-black text-gray-900 dark:text-white min-w-[1.5rem] text-center">{quantity}</span>
        <button
            onClick={onIncrement}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-30"
            disabled={quantity >= maxStock}
        >
            +
        </button>
    </div>
);

const ImageGallery: React.FC<{
    images: string[];
    productName: string;
    selectedIndex: number;
    onImageSelect: (index: number) => void;
}> = ({ images, productName, selectedIndex, onImageSelect }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const handleImageLoad = () => setImageLoading(false);
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
    };

    const handleImageChange = (index: number) => {
        setImageLoading(true);
        setImageError(false);
        setIsZoomed(false);
        onImageSelect(index);
    };

    return (
        <div className="space-y-6">
            <div className="relative bg-white dark:bg-gray-950 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group shadow-2xl shadow-gray-200/50 dark:shadow-none">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}

                <div
                    className="relative cursor-zoom-in h-[350px] md:h-[500px] overflow-hidden rounded-3xl"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                >
                    <img
                        src={images.length > 0 && !imageError ? images[selectedIndex] : '/placeholder-image.jpg'}
                        alt={productName}
                        className={`w-full h-full object-contain transition-transform duration-700 ease-out ${isZoomed ? 'scale-150' : 'scale-100'}`}
                        style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                </div>

                {!imageLoading && !imageError && (
                    <div className="absolute top-8 right-8 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                        🔍 Hover to zoom
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => handleImageChange(index)}
                            className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${selectedIndex === index
                                ? 'border-primary shadow-xl shadow-primary/20 scale-105'
                                : 'border-transparent bg-gray-50 dark:bg-gray-900 opacity-60 hover:opacity-100 hover:scale-105'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Share Button ─────────────────────────────────────────────────────────────
const ShareButton: React.FC<{ productName: string }> = ({ productName }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        const url = window.location.href;

        // Try native Web Share API first (mobile / modern browsers)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productName,
                    text: `Check out ${productName}`,
                    url,
                });
                return;
            } catch {
                // User cancelled or API unavailable – fall through to clipboard
            }
        }

        // Fallback: copy link to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Last resort: prompt
            window.prompt('Copy this link:', url);
        }
    };

    return (
        <button
            onClick={handleShare}
            title="Share product"
            className="relative p-3 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
            <Share2 className="w-5 h-5" />
            {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg whitespace-nowrap shadow-xl">
                    Link Copied!
                </span>
            )}
        </button>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SingleProduct: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { data, isLoading, isError, refetch } = useProductDetailsQuery(productId!);
    const { currencySymbol } = useConstants();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const cartItem = useMemo(() =>
        cartItems.find(item => item.productId === productId),
        [cartItems, productId]
    );

    const productImages = useMemo(() =>
        data?.product?.photos && data.product.photos.length > 0 ? data.product.photos : [],
        [data?.product?.photos]
    );

    const categoryInfo = useMemo(() => {
        if (!data?.product?.categories || data.product.categories.length === 0) return null;
        const category = data.product.categories[0];
        if (typeof category === 'object' && category !== null) {
            return { id: category._id, name: category.name || category.value };
        }
        return typeof category === 'string' && /^[0-9a-fA-F]{24}$/.test(category) ? { id: category, name: 'Category' } : null;
    }, [data?.product?.categories]);

    const handleAddToCart = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        if (!data?.product) return;
        const product = data.product;
        const finalPrice = product.netPrice || (product.price - (product.price * product.discount / 100));
        const item = {
            productId: product._id,
            name: product.name,
            price: finalPrice,
            quantity: 1,
            stock: product.stock,
            photo: productImages.length > 0 ? productImages[0] : '/placeholder-image.jpg',
            brand: typeof product.brand === 'object' ? { _id: product.brand._id, name: product.brand.name } : product.brand,
        };
        dispatch(addToCart(item));
    }, [data, productImages, dispatch]);

    const handleIncrement = useCallback(() => data?.product && dispatch(incrementCartItem(data.product._id)), [data, dispatch]);
    const handleDecrement = useCallback(() => data?.product && dispatch(decrementCartItem(data.product._id)), [data, dispatch]);
    const handleGoToCart = useCallback((e: React.MouseEvent) => { e.preventDefault(); navigate('/cart'); }, [navigate]);
    const handleImageSelect = useCallback((index: number) => setSelectedImageIndex(index), []);

    if (isLoading) return <ProductSkeleton />;
    if (isError || !data?.product) return <ErrorState onRetry={refetch} />;

    const product = data.product;

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors duration-500">
            <style>{wysiwygStyles}</style>

            <div className="container mx-auto px-4 py-12 md:py-20">
                {/* Top bar: back + share */}
                <div className="mb-12 flex items-center justify-between">
                    <BackButton />
                    <ShareButton productName={product.name} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column - Gallery */}
                    <ImageGallery
                        images={productImages}
                        productName={product.name}
                        selectedIndex={selectedImageIndex}
                        onImageSelect={handleImageSelect}
                    />

                    {/* Right Column - Info & Actions */}
                    <div className="space-y-10 sticky top-24">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current opacity-30" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">(24 Reviews)</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
                                {product.name}
                            </h1>
                            <StockIndicator stock={product.stock} />
                        </div>

                        <PriceDisplay
                            originalPrice={product.price}
                            netPrice={product.netPrice}
                            discount={product.discount}
                            currencySymbol={currencySymbol}
                        />

                        <ProductInfoSection product={product} />

                        <div className="p-8 bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8">
                            {cartItem ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Cart Quantity</span>
                                        <QuantitySelector
                                            quantity={cartItem.quantity}
                                            onIncrement={handleIncrement}
                                            onDecrement={handleDecrement}
                                            maxStock={product.stock}
                                        />
                                    </div>
                                    <button
                                        onClick={handleGoToCart}
                                        className="w-full bg-gray-900 dark:bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black dark:hover:bg-primary-dark transition-all shadow-2xl shadow-gray-900/20 dark:shadow-primary/20"
                                    >
                                        Go to Checkout →
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl flex items-center justify-center space-x-4 ${product.stock > 0
                                        ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{product.stock > 0 ? 'Collect to Cart' : 'Out of Stock'}</span>
                                </button>
                            )}

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/5 rounded-2xl"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Safe Payment</span>
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/5 rounded-2xl"><Truck className="w-5 h-5 text-primary" /></div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fast Logistics</span>
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/5 rounded-2xl"><RefreshCw className="w-5 h-5 text-primary" /></div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Return Policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 space-y-12">
                    <ProductDescription description={product.description} />

                    {categoryInfo && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Related Creations</h3>
                                <Link to={`/category/${categoryInfo.id}`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Collection →</Link>
                            </div>
                            <RelatedProducts
                                currentProductId={product._id}
                                categoryId={categoryInfo.id}
                                categoryName={categoryInfo.name}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleProduct;