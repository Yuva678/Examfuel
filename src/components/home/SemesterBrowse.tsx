import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const SemesterBrowse = () => {
  const semesters = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Semester ${i + 1}`,
  }));

  return (
    <section className="py-16 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Browse by Semester</h2>
          <p className="mt-4 text-xl text-gray-400">
            Find exactly what you need for your current classes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {semesters.map((sem) => (
            <Link
              key={sem.id}
              to={`/semester?s=${sem.id}`}
              className="glass-card p-6 flex flex-col items-center justify-center text-center group bg-surface-100 hover:bg-surface-50 border border-gold-border hover:border-brand-500/50 shadow-soft hover:shadow-gold transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="text-brand-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                {sem.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SemesterBrowse;
