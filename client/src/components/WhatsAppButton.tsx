import React, { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  title?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "201063166996",
  message = "مرحباً 👋\nانا اتي من موقع 2M Technology",
  className = "",
  title = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    {
      id: 'whatsapp',
      icon: FaWhatsapp,
      label: title || 'WhatsApp Chat',
      action: () => {
        const encodedMessage = encodeURIComponent(message || '');
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      },
      color: 'bg-[#25D366] hover:bg-[#128C7E]',
    },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed bottom-24 right-6 z-[60] ${className}`}>
      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 mb-2 w-52"
          >
            <div className="bg-white dark:bg-secondary-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="bg-primary p-4">
                <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Contact Us</p>
                <p className="text-white font-bold text-sm">How can we help?</p>
              </div>
              <div className="p-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => { contact.action(); setIsOpen(false); }}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                  >
                    <div className={`w-10 h-10 ${contact.color} text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <contact.icon className="text-xl" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{contact.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rotate-90'
          : 'bg-primary text-white hover:bg-primary-dark'
          }`}
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}

        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-900 border-2 border-primary rounded-full"
          />
        )}
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppButton;
