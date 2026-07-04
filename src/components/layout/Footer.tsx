import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gold-border relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-1.5 rounded-lg text-black">
                <BookOpen size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Examfuel</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Your one-stop platform for discovering, sharing, and mastering study materials. Study smarter, not harder.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/resources" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Previous Year Papers
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Presentations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/smart-stuff" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Smart Stuff
                </Link>
              </li>
              <li>
                <Link to="/semester" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Browse by Semester
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Account
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/login" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-base text-gray-400 hover:text-brand-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gold-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-500 xl:text-center">
            &copy; {new Date().getFullYear()} Examfuel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
