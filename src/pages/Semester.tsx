import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Layers, Loader2, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SemesterData {
  number: number;
  title: string;
  subjects: string[];
  description: string;
}

const Semester = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('s');
  const initialSemester = queryParam ? parseInt(queryParam, 10) : null;

  const [selectedSemester, setSelectedSemester] = useState<number | null>(
    initialSemester && initialSemester >= 1 && initialSemester <= 8 ? initialSemester : null
  );
  const [semesterCounts, setSemesterCounts] = useState<Record<string, number>>({});
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Sync URL when semester changes
  useEffect(() => {
    if (selectedSemester !== null) {
      navigate(`/semester?s=${selectedSemester}`, { replace: true });
    } else {
      navigate('/semester', { replace: true });
    }
  }, [selectedSemester, navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('semester, subject');
        
        if (error) throw error;

        const semCounts: Record<string, number> = {};
        const subjCounts: Record<string, number> = {};

        data?.forEach((resource) => {
          if (resource.semester) {
            semCounts[resource.semester] = (semCounts[resource.semester] || 0) + 1;
          }
          if (resource.subject) {
            subjCounts[resource.subject] = (subjCounts[resource.subject] || 0) + 1;
          }
        });

        setSemesterCounts(semCounts);
        setSubjectCounts(subjCounts);
      } catch (err) {
        console.error('Error fetching resource counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const semesters: SemesterData[] = [
    {
      number: 1,
      title: "Semester 1",
      description: "Foundation courses in physical sciences and basic engineering principles.",
      subjects: ["Engineering Physics", "Engineering Chemistry", "Basic Electrical Engineering", "Programming in C", "Workshop Practice", "Universal Human Values"]
    },
    {
      number: 2,
      title: "Semester 2",
      description: "Advanced math models, fundamentals of circuitry, and engineering graphics.",
      subjects: ["Engineering Mathematics I", "Basic Electronics", "Engineering Mechanics", "HTML & CSS", "Design Thinking", "Constitution of India"]
    },
    {
      number: 3,
      title: "Semester 3",
      description: "Introduction to logical data structures, algorithms, and digital circuits.",
      subjects: ["Engineering Mathematics II", "Discrete Mathematics", "Data Structures", "Digital Electronics", "Technical Communication", "Environmental Studies"]
    },
    {
      number: 4,
      title: "Semester 4",
      description: "Core subjects including Biology, Microcontrollers, Algorithms, DBMS, and Python programming.",
      subjects: [
        "Biology for Engineers", 
        "Microcontroller and Embedded Systems", 
        "Analysis and Design of Algorithms", 
        "Database Management System", 
        "Professional Skills for the Work Place", 
        "Algorithms Lab", 
        "Yoga", 
        "Universal human values course", 
        "Object Oriented Programming with Python", 
        "PROCTOR-CSE", 
        "CLUB ACTIVITIES"
      ]
    },
    {
      number: 5,
      title: "Semester 5",
      description: "Core database architectures, computer network models, and security principles.",
      subjects: ["Database Management Systems (DBMS)", "Computer Networks (CN)", "Software Engineering", "Microprocessors", "Cyber Security", "DevOps"]
    },
    {
      number: 6,
      title: "Semester 6",
      description: "Theory of computation, compiler design, and introductory AI domains.",
      subjects: ["Compiler Design", "Theory of Computation", "Artificial Intelligence", "Web Technology", "Embedded Systems", "IoT"]
    },
    {
      number: 7,
      title: "Semester 7",
      description: "High-performance distributed systems, cloud computing, and neural nets.",
      subjects: ["Machine Learning", "Distributed Systems", "Cloud Computing", "Cryptography", "Blockchain", "Professional Ethics"]
    },
    {
      number: 8,
      title: "Semester 8",
      description: "Specialized capstone topics in computer vision, deep learning, and research.",
      subjects: ["Deep Learning", "Big Data", "Edge Computing", "Computer Vision", "Full Stack Development", "Research Methodology"]
    }
  ];

  const handleSubjectClick = (subject: string) => {
    navigate(`/resources?subject=${encodeURIComponent(subject)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 bg-transparent">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
          <GraduationCap className="h-4 w-4" /> Academic Journey
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
          Browse by <span className="text-gradient">Semester</span>
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl font-medium leading-relaxed">
          Navigate your curriculum systematically. Click on any semester to explore core subjects and access curated study resources.
        </p>
      </div>

      {/* Grid of Semesters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {semesters.map((sem) => {
          const isSelected = selectedSemester === sem.number;
          const count = semesterCounts[sem.number.toString()] || 0;

          return (
            <button
              key={sem.number}
              onClick={() => setSelectedSemester(isSelected ? null : sem.number)}
              className={`text-left glass-card border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between h-64 ${
                isSelected 
                  ? 'border-brand-500 bg-brand-500/5 shadow-gold' 
                  : 'border-gold-border/20 hover:border-brand-500/40 hover:bg-[#111111]/70 hover:scale-[1.02]'
              }`}
            >
              {/* Semester Number Badge */}
              <div className="flex justify-between items-start">
                <div className={`text-3xl font-black ${isSelected ? 'text-brand-400' : 'text-gray-600 group-hover:text-brand-500/80 transition-colors'}`}>
                  0{sem.number}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400">
                  <Layers className="h-3 w-3 text-brand-500" />
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-brand-500" />
                  ) : (
                    <span>{count} Item{count !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="my-4">
                <h3 className="text-lg font-bold text-white mb-2">{sem.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">
                  {sem.description}
                </p>
              </div>

              {/* Action Button Indicator */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 mt-2">
                <span>{isSelected ? "Collapse Details" : "View Subjects"}</span>
                <ArrowRight className={`h-3 w-3 transition-transform duration-300 ${isSelected ? '-rotate-90' : 'group-hover:translate-x-1'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Subject Drawer */}
      {selectedSemester !== null && (() => {
        const allSubjects = semesters[selectedSemester - 1].subjects;

        return (
          <div className="glass-card border border-gold-border/30 bg-[#111111]/70 backdrop-blur-xl p-8 rounded-3xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-brand-500" /> Core Subjects — Semester {selectedSemester}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Select a subject below to view notes, previous year papers, and slides.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Award className="h-4 w-4" /> Recommended Syllabus
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allSubjects.map((subject, index) => {
                const subCount = subjectCounts[subject] || 0;
                return (
                  <button
                    key={index}
                    onClick={() => handleSubjectClick(subject)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gold-border/20 bg-[#0B0B0B] hover:border-brand-500/40 hover:bg-brand-500/5 group text-left transition-all duration-200"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors pr-2">
                        {subject}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {subCount > 0 
                          ? `${subCount} Item${subCount !== 1 ? 's' : ''}` 
                          : 'No uploads yet'
                        }
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-brand-500 text-gray-400 group-hover:text-black flex items-center justify-center transition-all duration-200">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Semester;
