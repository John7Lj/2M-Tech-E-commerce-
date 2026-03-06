import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface MobileUserButtonProps {
  onClick: () => void;
}

const MobileUserButton: React.FC<MobileUserButtonProps> = ({ onClick }) => {
  return (
    <div className="md:hidden">
      <motion.button
        onClick={onClick}
        className="flex items-center justify-center p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-lg">
          <User className="w-5 h-5 text-primary" />
        </div>
      </motion.button>
    </div>
  );
};

export default MobileUserButton;