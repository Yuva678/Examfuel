import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ResourceCard from '../components/resources/ResourceCard';

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

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get('q') || '';

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  /** Debounced search: waits 400ms after the user stops typing */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  /** Sync the URL query parameter so the search is shareable */
  useEffect(() => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, { replace: true });
    }
  }, [query, navigate]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setSearched(true);

    try {
      // Use Supabase's `or` filter to search across title, description, and subject
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, subject, semester, resource_type, file_type, downloads, views, created_at, file_url')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err instanceof Error ? err.message : err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 bg-transparent">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or subject..."
            autoFocus
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-gold-border bg-surface-100 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-lg shadow-soft transition-all duration-300"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-medium">
            No results found for "<span className="font-bold text-white">{query}</span>"
          </p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm font-medium text-gray-400 mb-6">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 font-medium">Start typing to search resources.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
