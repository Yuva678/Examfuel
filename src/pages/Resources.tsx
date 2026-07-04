import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Loader2, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ResourceCard from '../components/resources/ResourceCard';

/** Shape of a resource row coming from the database */
interface Resource {
  id: string;
  title: string;
  subject: string | null;
  semester: string | null;
  resource_type: string | null;
  file_type: string | null;
  downloads: number | null;
  views: number | null;
  created_at: string;
  file_url: string;
}

const SUBJECTS = [
  'Biology for Engineers',
  'Microcontroller and Embedded Systems',
  'Analysis and Design of Algorithms',
  'Database Management System',
  'Professional Skills for the Work Place',
  'Algorithms Lab',
  'Yoga',
  'Universal human values course',
  'Object Oriented Programming with Python',
  'PROCTOR-CSE',
  'CLUB ACTIVITIES',
  'Engineering Mathematics I',
  'Engineering Mathematics II',
  'Engineering Mathematics III',
  'Engineering Mathematics IV',
  'Discrete Mathematics',
  'Probability & Statistics',
  'Linear Algebra',
  'Numerical Methods',
  'Programming',
  'Programming in C',
  'Python Programming',
  'C++',
  'Java',
  'Data Structures',
  'Algorithms',
  'Object-Oriented Programming',
  'Competitive Programming',
  'Computer Science',
  'Database Management Systems (DBMS)',
  'Operating Systems (OS)',
  'Computer Networks (CN)',
  'Computer Organization',
  'Digital Logic',
  'Software Engineering',
  'Compiler Design',
  'Theory of Computation',
  'Microprocessors',
  'Microcontrollers',
  'Distributed Systems',
  'Cloud Computing',
  'Edge Computing',
  'Parallel Computing',
  'High Performance Computing',
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Neural Networks',
  'Data Mining',
  'Data Analytics',
  'Big Data',
  'Natural Language Processing (NLP)',
  'Computer Vision',
  'Reinforcement Learning',
  'Generative AI',
  'Expert Systems',
  'Cyber Security',
  'Ethical Hacking',
  'Network Security',
  'Information Security',
  'Cryptography',
  'Digital Forensics',
  'Blockchain',
  'Web & Mobile',
  'Web Technology',
  'HTML & CSS',
  'JavaScript',
  'React',
  'Angular',
  'Node.js',
  'Full Stack Development',
  'Mobile App Development',
  'Android Development',
  'UI/UX Design',
  'Electronics',
  'Basic Electronics',
  'Analog Electronics',
  'Digital Electronics',
  'Signals & Systems',
  'Electronic Devices',
  'VLSI Design',
  'Embedded Systems',
  'FPGA',
  'IoT',
  'Communication Systems',
  'Wireless Communication',
  'Electrical',
  'Basic Electrical Engineering',
  'Electrical Machines',
  'Power Systems',
  'Power Electronics',
  'Control Systems',
  'Electric Drives',
  'Renewable Energy',
  'Smart Grid',
  'Mechanical',
  'Engineering Mechanics',
  'Engineering Graphics',
  'Thermodynamics',
  'Fluid Mechanics',
  'Heat Transfer',
  'Manufacturing Process',
  'Machine Design',
  'CAD/CAM',
  'Robotics',
  'Mechatronics',
  'Industrial Engineering',
  'Automobile Engineering',
  'Civil',
  'Surveying',
  'Strength of Materials',
  'Structural Analysis',
  'RCC Design',
  'Steel Structures',
  'Geotechnical Engineering',
  'Transportation Engineering',
  'Environmental Engineering',
  'Water Resources Engineering',
  'Construction Management',
  'Common Engineering',
  'Engineering Physics',
  'Engineering Chemistry',
  'Environmental Studies',
  'Engineering Drawing',
  'Workshop Practice',
  'Design Thinking',
  'Innovation & Entrepreneurship',
  'Professional Ethics',
  'Constitution of India',
  'Universal Human Values',
  'Technical Communication',
  'Aptitude',
  'Research Methodology',
  'Project Management',
  'Emerging Technologies',
  'Internet of Things (IoT)',
  'DevOps',
  'Docker',
  'Kubernetes',
  'Quantum Computing',
  'AR/VR',
  'Digital Twin',
  'Robotics Process Automation (RPA)',
  'FinTech',
  'Bioinformatics'
];

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  labelPrefix?: string;
}

const CustomSelect = ({ value, onChange, options, placeholder, labelPrefix = '' }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="w-full flex items-center justify-between rounded-xl border border-gold-border bg-surface-100 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-soft transition-all hover:border-brand-500/50 cursor-pointer text-left"
      >
        <span className={value ? "text-white font-medium" : "text-gray-400 font-medium"}>
          {value ? `${labelPrefix}${value}` : placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-brand-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-gold-border/30 bg-[#111111]/95 backdrop-blur-xl shadow-2xl py-2 flex flex-col max-h-80">
            {options.length > 10 && (
              <div className="px-3 pb-2 border-b border-white/5 mb-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0B0B] border border-gold-border/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder-gray-500"
                  autoFocus
                />
              </div>
            )}
            
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-brand-500/30">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-brand-500/10 hover:text-brand-400 transition-colors"
                  >
                    {placeholder}
                  </button>
                  {filteredOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        value === opt 
                          ? 'text-brand-400 bg-brand-500/10 font-semibold' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {labelPrefix}{opt}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Resources = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states — initialize from URL query params
  const [filterSubject, setFilterSubject] = useState(searchParams.get('subject') || '');
  const [filterSemester, setFilterSemester] = useState(searchParams.get('semester') || '');
  const [filterType, setFilterType] = useState(searchParams.get('type') || '');

  const hasActiveFilter = filterSubject || filterSemester || filterType;

  useEffect(() => {
    if (hasActiveFilter) {
      fetchResources();
    } else {
      setResources([]);
      setLoading(false);
    }
  }, [filterSubject, filterSemester, filterType]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('resources')
        .select('id, title, subject, semester, resource_type, file_type, downloads, views, created_at, file_url')
        .order('created_at', { ascending: false });

      // Apply filters only if selected
      if (filterSubject) {
        if (filterSubject === 'Microcontroller and Embedded Systems' || filterSubject === 'Microcontroller and Embedded System') {
          query = query.in('subject', ['Microcontroller and Embedded Systems', 'Microcontroller and Embedded System']);
        } else {
          query = query.eq('subject', filterSubject);
        }
      }
      if (filterSemester) query = query.eq('semester', filterSemester);
      if (filterType) query = query.eq('resource_type', filterType);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching resources.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resources</h1>
          <p className="mt-2 text-gray-400 font-medium">
            {hasActiveFilter 
              ? `Browse ${resources.length} study materials matching your criteria.`
              : 'Find study materials shared by the community.'}
          </p>
        </div>
        {user && (
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-bold text-black shadow-gold-soft hover:shadow-gold transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Upload
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <CustomSelect
          value={filterSubject}
          onChange={setFilterSubject}
          placeholder="All Subjects"
          options={SUBJECTS}
        />
        
        <CustomSelect
          value={filterSemester}
          onChange={setFilterSemester}
          placeholder="All Semesters"
          labelPrefix="Semester "
          options={['1', '2', '3', '4', '5', '6', '7', '8']}
        />

        <CustomSelect
          value={filterType}
          onChange={setFilterType}
          placeholder="All Types"
          options={['Notes', 'Past Paper', 'Assignment', 'Lab Manual', 'Cheatsheet', 'Slides', 'Other']}
        />
      </div>

      {/* Content */}
      {!hasActiveFilter ? (
        <div className="text-center py-20 bg-surface-100 rounded-2xl border border-gold-border/50">
          <div className="mx-auto w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-brand-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Find What You Need</h3>
          <p className="text-gray-400 font-medium max-w-md mx-auto">
            Please select a Subject, Semester, or Type from the dropdowns above to view the resources.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-4 font-medium">{error}</p>
          <button onClick={fetchResources} className="text-brand-500 font-bold hover:text-brand-400 transition-colors">
            Try again
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-surface-100 rounded-2xl border border-gold-border/50">
          <p className="text-gray-400 mb-4 font-medium">No resources found.</p>
          {user && (
            <Link to="/upload" className="text-brand-500 font-bold hover:text-brand-400 transition-colors">
              Be the first to upload!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
