import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Calendar,
  Edit3,
  Save,
  X,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { RootState } from '../redux/store';
import { useMyOrdersQuery } from '../redux/api/order.api';
import { useUpdateProfileMutation } from '../redux/api/user.api';
import { userExists } from '../redux/reducers/user.reducer';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    gender: user?.gender || 'male'
  });

  // Fetch real orders from API
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useMyOrdersQuery('');
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('gender', editForm.gender);
      formData.append('dob', editForm.dob);

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const response = await updateProfile(formData).unwrap();

      if (response.success) {
        // Update Redux state with new user data
        dispatch(userExists(response.user));
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message or toast
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      gender: user?.gender || 'male'
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-primary bg-primary/10 border-primary/20';
      case 'shipped':
      case 'processing': return 'text-primary bg-primary/5 border-primary/10';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return CheckCircle;
      case 'shipped': return Truck;
      case 'processing':
      case 'pending': return Clock;
      case 'cancelled': return AlertCircle;
      default: return Package;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not Logged In</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Please sign in to access your profile and track your orders</p>
          <motion.button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        {/* Header Section */}
        <div className="bg-primary px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <motion.img
                src={previewUrl || user.photoURL}
                alt="Profile"
                className="h-28 w-28 rounded-3xl border-4 border-white/20 shadow-2xl object-cover backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              {isEditing && (
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2.5 bg-white text-primary rounded-xl shadow-xl hover:bg-gray-50 transition-all border border-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black mb-1 tracking-tight">
                <span className="text-sm font-medium opacity-80 block uppercase tracking-widest mb-1">Account Dashboard</span>
                {isEditing ? editForm.name : user.name}
              </h1>
              <p className="text-white/80 font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex space-x-8 px-8">
            {[
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'orders', label: 'Order History', icon: Package },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-5 px-1 border-b-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Personal Information */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Details</h3>
                      <p className="text-sm text-primary hover:text-primary-dark transition-colors font-bold">Manage your personal information and preferences</p>
                    </div>
                    <motion.button
                      onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${isEditing
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 shadow-none'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </motion.button>
                  </div>

                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {isEditing ? (
                      <>
                        {/* Edit Form */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editForm.dob}
                            onChange={(e) => handleEditFormChange('dob', e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-bold"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Gender</label>
                          <select
                            value={editForm.gender}
                            onChange={(e) => handleEditFormChange('gender', e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-bold"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Profile Photo</label>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <motion.button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 font-bold"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Upload className="w-5 h-5" />
                                <span>{selectedFile ? selectedFile.name : 'Choose new photo'}</span>
                              </motion.button>
                            </div>
                            {(previewUrl || selectedFile) && (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-lg"
                              />
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 flex items-center space-x-4">
                          <motion.button
                            onClick={handleSaveProfile}
                            disabled={isUpdating}
                            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                          </motion.button>
                          <motion.button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Display Mode */}
                        <div className="flex items-center space-x-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-primary">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-0.5 mb-1">Full Name</p>
                            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-primary">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-0.5 mb-1">Date of Birth</p>
                            <p className="font-bold text-gray-900 dark:text-white">{new Date(user.dob).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-primary">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-0.5 mb-1">Gender</p>
                            <p className="font-bold text-gray-900 dark:text-white capitalize">{user.gender}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-primary">
                            <Edit3 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-0.5 mb-1">Email Address</p>
                            <p className="font-bold text-gray-900 dark:text-white">{user.email}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">My Orders</h3>
                  {ordersData?.orders && (
                    <p className="text-gray-500">{ordersData.orders.length} orders</p>
                  )}
                </div>

                {ordersLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading orders...</span>
                  </motion.div>
                ) : ordersError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700"
                  >
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Orders</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">There was an error retrieving your order history. Please try again.</p>
                    <motion.button
                      onClick={() => window.location.reload()}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Retry Now
                    </motion.button>
                  </motion.div>
                ) : ordersData?.orders && ordersData.orders.length > 0 ? (
                  <div className="space-y-4">
                    {ordersData.orders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center space-x-5">
                              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-7 h-7" />
                              </div>
                              <div>
                                <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Order #{order._id.slice(-8).toUpperCase()}</h4>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-3xl font-black text-primary mb-1 tracking-tighter">LE {order.total.toLocaleString()}</p>
                              <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          {order.orderItems && order.orderItems.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                              <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Package Contents:</h5>
                              <div className="space-y-4">
                                {order.orderItems.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">{item.name}</span>
                                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">× {item.quantity}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">LE {(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-8">
                            <motion.button
                              onClick={() => navigate(`/order/${order._id}`)}
                              className="text-primary hover:text-primary-dark font-black text-xs uppercase tracking-widest transition-all px-2 py-1"
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Details →
                            </motion.button>
                            {order.status.toLowerCase() === 'delivered' && (
                              <motion.button
                                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/products')}
                              >
                                Buy Again
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Start your journey with us and discover our amazing collections</p>
                    <motion.button
                      onClick={() => navigate('/products')}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Browse Products
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;