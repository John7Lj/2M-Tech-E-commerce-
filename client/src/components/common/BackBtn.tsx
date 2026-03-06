import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton: React.FC = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-2.5 bg-white dark:bg-secondary-dark text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 font-bold text-sm shadow-sm"
        >
            <FaArrowLeft className="w-3 h-3" />
            <span>Back</span>
        </button>
    );
};

export default BackButton;
