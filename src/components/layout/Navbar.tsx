import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, BookOpen, LogOut, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LiveSearchResult {
  id: string;
  title: string;
  subject: string;
  resource_type: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Live Search States
  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Resources', path: '/resources' },
    { name: 'Smart Stuff', path: '/smart-stuff' },
    { name: 'Semester', path: '/semester' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subject, resource_type')
          .or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,subject.ilike.%${searchQuery.trim()}%`)
          .limit(5);

        if (error) throw error;
        setLiveResults(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectResult = (id: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/resources/${id}`);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#000000]/30 backdrop-blur-lg border-b border-gold-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setSearchQuery('')}>
              <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-2 rounded-xl text-black shadow-gold-soft transition-transform group-hover:scale-105 duration-200">
                <BookOpen size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Examfuel</span>
            </Link>
          </div>

          {/* Center: Search Bar with Live Autocomplete */}
          <div className="flex-1 max-w-xl px-4 lg:px-8 hidden md:block relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isSearchingLive ? (
                  <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() && liveResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search notes, PYQs, PDFs, PPTs..."
                className="block w-full pl-12 pr-4 py-2.5 border border-gold-border rounded-full leading-5 bg-surface-100 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 shadow-sm"
              />
            </form>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-4 right-8 mt-2 bg-[#111111] border border-gold-border rounded-2xl shadow-xl overflow-hidden py-2 animate-fade-in z-50">
                {liveResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Quick Results
                    </div>
                    {liveResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectResult(result.id)}
                        className="px-4 py-3 hover:bg-surface-100 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <div className="p-2 bg-brand-500/10 rounded-lg shrink-0">
                          <FileText className="h-4 w-4 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{result.title}</div>
                          <div className="text-xs text-gray-400 truncate">{result.subject} • {result.resource_type}</div>
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={(e) => handleSearch(e as any)}
                      className="px-4 py-3 text-sm text-center text-brand-400 hover:text-brand-300 hover:bg-surface-100 cursor-pointer border-t border-gold-border/20 mt-1 transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No matching resources found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path 
                    ? 'text-black bg-gradient-to-r from-brand-500 to-brand-600 shadow-gold-soft' 
                    : 'text-gray-300 hover:text-brand-400 hover:bg-surface-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 pl-4 ml-2 border-l border-gold-border">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center justify-center p-1 rounded-full text-gray-400 hover:text-brand-400 hover:bg-surface-50 transition-colors"
                  >
                    {user.user_metadata?.avatar_url && !imageError ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        onError={() => setImageError(true)}
                        className="h-8 w-8 rounded-full object-cover border border-brand-500/30"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-500 text-black flex items-center justify-center font-bold text-sm border border-brand-500/30">
                        {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-black shadow-gold-soft hover:scale-[1.02] transition-transform duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass absolute top-20 left-0 w-full border-b border-gold-border">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <div className="py-2 mb-2 relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearchingLive ? (
                    <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim() && liveResults.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Search resources..."
                  className="block w-full pl-10 pr-3 py-3 border border-gold-border rounded-xl leading-5 bg-surface-100 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </form>
              
              {/* Mobile Live Dropdown */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-gold-border rounded-xl shadow-xl overflow-hidden py-2 z-50">
                  {liveResults.length > 0 ? (
                    <>
                      {liveResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => {
                            handleSelectResult(result.id);
                            setMobileMenuOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-surface-100 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <div className="p-2 bg-brand-500/10 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{result.title}</div>
                            <div className="text-xs text-gray-400 truncate">{result.subject}</div>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={(e) => handleSearch(e as any)}
                        className="px-4 py-3 text-sm text-center text-brand-400 hover:text-brand-300 hover:bg-surface-100 cursor-pointer border-t border-gold-border/20 mt-1"
                      >
                        View all results
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-gray-400">
                      No matching resources found.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-black bg-gradient-to-r from-brand-500 to-brand-600'
                    : 'text-gray-300 hover:text-brand-400 hover:bg-surface-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-brand-400 hover:bg-surface-50 transition-colors"
                >
                  {user.user_metadata?.avatar_url && !imageError ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      onError={() => setImageError(true)}
                      className="h-8 w-8 rounded-full object-cover border border-brand-500/30"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-500 text-black flex items-center justify-center font-bold text-sm border border-brand-500/30">
                      {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 border border-gold-border rounded-full text-base font-medium text-white hover:bg-surface-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full text-base font-medium text-black shadow-gold-soft hover:scale-[1.02] transition-transform"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
