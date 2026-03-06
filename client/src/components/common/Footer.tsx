import { Link } from 'react-router-dom';
import { useConstants } from '../../hooks/useConstants';
import { useSocialLinks, useCompanyAddress } from './header/constants';
import { Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { constants, isLoading } = useConstants();
  const socialLinks = useSocialLinks();
  const companyAddress = useCompanyAddress();

  if (isLoading) {
    return (
      <footer className="bg-white dark:bg-secondary-dark border-t border-gray-100 dark:border-gray-800 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-secondary-dark border-t-2 border-primary-light/10 text-gray-800 dark:text-gray-200 py-16 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

          {/* Brand & Social Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src={constants.logo}
                alt={`${constants.companyName} Logo`}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-primary dark:text-primary-light tracking-tight">
                {constants.companyName}
              </span>
            </div>
            <a
              href={
                (companyAddress || constants.address)?.startsWith('http')
                  ? (companyAddress || constants.address)
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress || constants.address || constants.companyName)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs hover:text-primary transition-colors block"
            >
              {companyAddress || constants.address || "Your premium destination for quality products and exceptional service."}
            </a>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-accent dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 shadow-sm"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-3">
              Quick Links
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { label: 'About Us', href: '/pages/about-us' },
                { label: 'FAQ', href: '/pages/faq' },
                { label: 'Privacy Policy', href: '/pages/privacy-policy' },
                { label: 'Terms & Conditions', href: '/pages/term-conditions' },
                { label: 'Refund Policy', href: '/pages/refund-policy' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full mr-2 group-hover:bg-primary transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-3">
              Contact Us
            </h3>
            <div className="space-y-4">
              {constants.email && (
                <a href={`mailto:${constants.email}`} className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group">
                  <Mail className="w-5 h-5 text-primary/60 group-hover:text-primary" />
                  <span>{constants.email}</span>
                </a>
              )}
              {constants.phone && (
                <a href={`tel:${constants.phone}`} className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group">
                  <Phone className="w-5 h-5 text-primary/60 group-hover:text-primary" />
                  <span>{constants.phone}</span>
                </a>
              )}
              {constants.website && (
                <a href={constants.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group">
                  <ExternalLink className="w-5 h-5 text-primary/60 group-hover:text-primary" />
                  <span>{constants.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500 dark:text-gray-500 font-medium order-2 md:order-1">
            © {new Date().getFullYear()} {constants.companyName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm md:text-base font-black text-gray-900 dark:text-white uppercase tracking-widest order-1 md:order-2">
            <span className="opacity-40">Powered by :</span>
            <a
              href="https://wa.me/201006683289"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              01006683289
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Spacer to clear Bottom Navigation */}
      <div className="h-32 md:hidden" />
    </footer>
  );
};

export default Footer;