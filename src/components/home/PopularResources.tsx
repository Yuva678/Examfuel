import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, TrendingUp, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Resource } from '../../types';

const PopularResources = () => {
  const [popular, setPopular] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, views, downloads, uploader:users(name)')
          .order('views', { ascending: false })
          .limit(3);

        if (error) throw error;
        setPopular((data as unknown as Resource[]) || []);
      } catch (err) {
        console.error('Error fetching popular resources:', err instanceof Error ? err.message : err);
        setPopular([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPopular();
  }, []);

  return (
    <section className="py-16 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-500/10 p-2.5 rounded-xl border border-brand-500/20">
            <TrendingUp className="text-brand-500" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Popular Right Now</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="p-6 rounded-2xl bg-surface-50 animate-pulse h-40 border border-gold-border/50"></div>
            ))}
          </div>
        ) : popular.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-gold-border/20 bg-[#0B0B0B]/50 max-w-lg mx-auto">
            <h3 className="text-white font-bold text-lg mb-2">Stay Tuned!</h3>
            <p className="text-gray-400 text-sm">Trending study materials will appear here as the community interacts with uploads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {popular.map((item, i) => (
              <Link key={item.id} to={`/resources/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-6 rounded-2xl bg-surface-100 border border-gold-border shadow-soft hover:shadow-gold hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform group-hover:scale-110">
                    <BookMarked size={120} className="text-brand-500" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10 line-clamp-2 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                  <p className="text-sm font-medium text-gray-400 mb-8 relative z-10">Shared by {item.uploader?.name || 'Anonymous'}</p>
                  
                  <div className="flex items-center gap-5 text-sm font-semibold text-gray-300 relative z-10 pt-4 border-t border-gold-border/50">
                    <span className="flex items-center gap-1.5">
                      <Eye size={16} className="text-brand-500" /> {item.views >= 1000 ? (item.views/1000).toFixed(1)+'k' : item.views}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Download size={16} className="text-gray-500" /> {item.downloads >= 1000 ? (item.downloads/1000).toFixed(1)+'k' : item.downloads}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularResources;
