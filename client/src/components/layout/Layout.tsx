import React from 'react';
import Header from '../common/header/index';
import Footer from '../common/Footer';
import WhatsAppButton from '../WhatsAppButton';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  showWhatsApp?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ showWhatsApp = true }) => {
  return (
    <>
      <div className='w-full'>
        <Header />
        {/* ✅ FIXED: Remove container padding and max-width for full-width components */}
        <main className="w-full pt-16 md:pt-20">
          <Outlet />
        </main>


        <Footer />

        {/* WhatsApp floating button */}
        {showWhatsApp && <WhatsAppButton />}
      </div>
    </>
  );
};

export default Layout;