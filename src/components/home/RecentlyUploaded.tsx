import { useEffect, useState } from 'react';
import { Clock, Download, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Resource } from '../../types';

const RecentlyUploaded = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentResources() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subject, resource_type, downloads, created_at')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setResources((data as unknown as Resource[]) || []);
      } catch (err) {
        console.error('Error fetching recent resources:', err instanceof Error ? err.message : err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentResources();
  }, []);

  return (
    <section className="py-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Recently Uploaded</h2>
            <p className="mt-2 text-gray-400">Fresh study materials from the community.</p>
          </div>
          <Link
            to="/resources"
            className="text-brand-400 font-medium hover:text-brand-500 hover:underline hidden sm:block transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse flex flex-col justify-between">
                <div className="flex justify-between"><div className="w-16 h-6 bg-surface-50 rounded-full"></div></div>
                <div><div className="w-3/4 h-5 bg-surface-50 rounded mb-3"></div><div className="w-1/2 h-4 bg-surface-50 rounded"></div></div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-gold-border/20 bg-[#0B0B0B]/50 max-w-lg mx-auto">
            <h3 className="text-white font-bold text-lg mb-2">Stay Tuned!</h3>
            <p className="text-gray-400 text-sm">Fresh study materials from the community are on their way. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource: any, i) => (
              <Link key={resource.id} to={`/resources/${resource.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border border-gold-border bg-surface-100 p-6 hover:border-brand-500/50 shadow-soft hover:shadow-gold transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-48"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {resource.resource_type || 'Other'}
                      </span>
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} /> {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 mb-4 truncate">{resource.subject}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-medium text-gray-400 pt-3 border-t border-gold-border/50">
                    <div className="flex items-center gap-1.5">
                      <Download size={16} /> {resource.downloads || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-500">
                      <Star size={16} className="fill-current" /> 4.8
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/resources"
            className="text-brand-400 font-medium hover:text-brand-500 hover:underline transition-colors"
          >
            View all resources &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyUploaded;
