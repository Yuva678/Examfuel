import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const CommunityStats = () => {
  const [stats, setStats] = useState([
    { label: 'Active Students', value: '0' },
    { label: 'Resources Shared', value: '0' },
    { label: 'Total Downloads', value: '0' },
    { label: 'Universities', value: '0' },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: resourceCount } = await supabase.from('resources').select('*', { count: 'exact', head: true });
        
        // Sum downloads - this requires a custom RPC or we can just fetch the aggregate if supported, 
        // for now we'll just show the resource count as a basic proof of concept since aggregation requires RPC
        
        setStats([
          { label: 'Active Students', value: (userCount || 0).toString() },
          { label: 'Resources Shared', value: (resourceCount || 0).toString() },
          { label: 'Total Downloads', value: '...' },
          { label: 'Universities', value: '...' },
        ]);
      } catch (e) {
        console.error("Stats error", e);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="py-20 border-t border-gold-border/30 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-8 rounded-2xl bg-surface-100 border border-gold-border/30 hover:border-gold-border/80 transition-colors duration-300 shadow-soft">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-brand-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityStats;
