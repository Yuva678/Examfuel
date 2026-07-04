import { motion } from 'framer-motion';
import { Search, Upload, BookOpen, FileText, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-50 border border-gold-border text-brand-500 text-sm font-semibold mb-8 shadow-soft">
            <Sparkles size={16} /> Welcome to the new standard of learning
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Study <span className="text-gradient">Smarter</span>,<br /> Not Harder.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
            Find notes, previous year question papers, PDFs, PPTs, and study resources shared by students. Upload your own materials, help others succeed, and discover smart learning tools—all in one place.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link
            to="/resources"
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-full text-black bg-gradient-to-r from-brand-500 to-brand-600 shadow-gold-soft hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-black transition-all hover:scale-[1.02] duration-200 w-full sm:w-auto"
          >
            <Search size={20} />
            Search Resources
          </Link>
          <Link
            to="/upload"
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold-border text-base font-medium rounded-full text-white bg-surface-100 hover:bg-surface-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black transition-all hover:scale-[1.02] duration-200 w-full sm:w-auto shadow-soft"
          >
            <Upload size={20} />
            Upload Resource
          </Link>
        </motion.div>

        {/* Feature quick links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-4xl mx-auto"
        >
          {[
            { name: 'Notes', icon: BookOpen, path: '/resources' },
            { name: 'PYQs', icon: FileText, path: '/resources' },
            { name: 'Smart Tools', icon: Sparkles, path: '/smart-stuff' },
            { name: 'Community', icon: Users, path: '/semester' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="cursor-pointer flex flex-col items-center p-6 glass-card group hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="bg-surface-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-8 w-8 text-brand-500" />
              </div>
              <span className="text-sm font-semibold text-gray-200 tracking-wide uppercase">{item.name}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
