import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DotField from '../ui/DotField';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Upper section containing DotField, Navbar, and Main content */}
      <div className="relative flex-grow flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-100/20 via-black to-black">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <DotField
            dotRadius={1.8}
            dotSpacing={16}
            bulgeStrength={80}
            glowRadius={200}
            sparkle={true}
            waveAmplitude={5}
            gradientFrom="rgba(245, 179, 1, 0.5)"
            gradientTo="rgba(255, 215, 0, 0.25)"
            cursorRadius={600}
          />
        </div>
        <Navbar />
        <main className="flex-grow z-10 relative pt-20">{children}</main>
      </div>
      
      {/* Footer is outside the DotField container */}
      <Footer />
    </div>
  );
};

export default Layout;
