import {
  FaHome,
  FaStore,
  FaUsers,
  FaShoppingCart,
  FaFacebook,
  FaWhatsapp,
  FaFacebookMessenger,
  FaEnvelope
} from 'react-icons/fa';
import { NavigationItem, SocialLink } from './types';
import { useConstants } from '../../../hooks/useConstants';

export const navigationItems: NavigationItem[] = [
  { to: "/", icon: FaHome, label: "Home" },
  { to: "/products", icon: FaStore, label: "Products" },
  { to: "/pages/about-us", icon: FaUsers, label: "About Us" },
  { to: "/cart", icon: FaShoppingCart, label: "Cart" }
];

export const bottomNavigationItems: NavigationItem[] = [
  { to: "/", icon: FaHome, label: "Home" },
  { to: "/products", icon: FaStore, label: "Shop" },
  { to: "/cart", icon: FaShoppingCart, label: "Cart" }
];

// Hook to get dynamic social links from constants
export const useSocialLinks = (): SocialLink[] => {
  const { constants } = useConstants();

  const whatsappNumber = constants.whatsapp || "201063166996";
  const cleanWhatsapp = whatsappNumber.startsWith('0') ? '2' + whatsappNumber : whatsappNumber.replace('+', '');
  const message = `مرحباً 👋\nانا اتي من موقع ${constants.companyName || '2M Technology'}`;
  const encodedMsg = encodeURIComponent(message);

  return [
    {
      name: 'Facebook',
      url: constants.facebook,
      icon: FaFacebook,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/${cleanWhatsapp}?text=${encodedMsg}`,
      icon: FaWhatsapp,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    },
    {
      name: 'Messenger',
      url: `https://m.me/100063704366290?text=${encodedMsg}`,
      icon: FaFacebookMessenger,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    },
    {
      name: 'Email',
      url: `mailto:${constants.email}`,
      icon: FaEnvelope,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20'
    }
  ].filter(link => link.url && link.url !== 'mailto:');
};

// Hook to get company address from constants
export const useCompanyAddress = () => {
  const { constants } = useConstants();
  return constants.address;
};

