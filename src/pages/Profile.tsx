import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ResourceCard from '../components/resources/ResourceCard';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

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

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myUploads, setMyUploads] = useState<Resource[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'uploads' | 'saved'>('uploads');
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch user's uploads
      const { data: uploadsData } = await supabase
        .from('resources')
        .select('id, title, subject, semester, resource_type, file_type, downloads, views, created_at, file_url')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false });

      setMyUploads(uploadsData || []);

      // Fetch bookmarked resources (join through bookmarks table)
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select(`
          resource_id,
          resources (
            id, title, subject, semester, resource_type, file_type, downloads, views, created_at, file_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Extract the nested resource objects
      const saved = (bookmarksData || [])
        .map((b: any) => b.resources)
        .filter(Boolean) as Resource[];

      setSavedResources(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 bg-transparent">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 md:p-8 rounded-2xl border border-gold-border bg-surface-100 shadow-soft">
        {/* Avatar */}
        {profile?.avatar_url && !imageError ? (
          <img
            src={profile.avatar_url}
            alt={profile.username || 'User'}
            onError={() => setImageError(true)}
            className="h-20 w-20 rounded-full object-cover border-2 border-brand-500 shadow-soft"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-brand-500 text-black flex items-center justify-center font-bold text-3xl border-2 border-brand-500 shadow-soft">
            {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-white">
            {profile?.username || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1">
            Joined {profile ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''}
          </p>
          <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
            <span className="text-sm text-gray-400">
              <span className="font-bold text-white">{myUploads.length}</span> uploads
            </span>
            <span className="text-sm text-gray-400">
              <span className="font-bold text-white">{savedResources.length}</span> saved
            </span>
          </div>
        </div>

        <div className="sm:ml-auto">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-bold text-black shadow-gold-soft hover:shadow-gold transition-all duration-200 hover:scale-[1.02]"
          >
            <Upload className="h-4 w-4" /> Upload
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gold-border/50 mb-8">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'uploads'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-400 hover:text-white hover:border-gold-border/50'
          }`}
        >
          <Upload className="h-4 w-4" /> My Uploads ({myUploads.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-400 hover:text-white hover:border-gold-border/50'
          }`}
        >
          <Bookmark className="h-4 w-4" /> Saved ({savedResources.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'uploads' ? (
        myUploads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myUploads.map((r) => (
              <ResourceCard key={r.id} {...r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-100 rounded-2xl border border-gold-border/30">
            <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4 font-medium">You haven't uploaded anything yet.</p>
            <Link to="/upload" className="text-brand-500 font-semibold hover:text-brand-400 transition-colors">Upload your first resource</Link>
          </div>
        )
      ) : (
        savedResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResources.map((r) => (
              <ResourceCard key={r.id} {...r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-100 rounded-2xl border border-gold-border/30">
            <Bookmark className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4 font-medium">No saved resources yet.</p>
            <Link to="/resources" className="text-brand-500 font-semibold hover:text-brand-400 transition-colors">Browse resources</Link>
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
