import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Eye, ArrowLeft, FileText, Loader2, Calendar, Tag, GraduationCap, Building, Maximize2, Minimize2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ResourceCard from '../components/resources/ResourceCard';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  semester: string | null;
  university: string | null;
  resource_type: string | null;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  downloads: number | null;
  views: number | null;
  created_at: string;
}

interface RelatedResource {
  id: string;
  title: string;
  subject: string | null;
  semester: string | null;
  resource_type: string | null;
  file_type: string | null;
  downloads: number | null;
  views: number | null;
  created_at: string;
}

/** Check if the file type supports inline preview */
const getPreviewType = (fileType: string | null): 'pdf' | 'image' | 'office' | 'none' => {
  const type = (fileType || '').toUpperCase();
  if (type === 'PDF') return 'pdf';
  if (['PNG', 'JPEG', 'JPG', 'WEBP'].includes(type)) return 'image';
  if (['DOC', 'DOCX', 'PPT', 'PPTX'].includes(type)) return 'office';
  return 'none';
};

const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [related, setRelated] = useState<RelatedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResource(id);
    }
  }, [id]);

  // Close fullscreen on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchResource = async (resourceId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the resource
      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;
      setResource(data);

      // Increment view count (fire-and-forget, no need to await)
      supabase.rpc('increment_views', { resource_id: resourceId }).then();

      // Fetch related resources (same subject, excluding current)
      if (data.subject) {
        const { data: relatedData } = await supabase
          .from('resources')
          .select('id, title, subject, semester, resource_type, file_type, downloads, views, created_at, file_url')
          .eq('subject', data.subject)
          .neq('id', resourceId)
          .order('created_at', { ascending: false })
          .limit(3);

        setRelated(relatedData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading the resource.');
    } finally {
      setLoading(false);
    }
  };

  /** Handle download: increment count and open file */
  const handleDownload = async () => {
    if (!resource) return;

    // Increment download count
    supabase.rpc('increment_downloads', { resource_id: resource.id }).then();

    // Open file URL in new tab
    window.open(resource.file_url, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400 mb-4">{error || 'Resource not found.'}</p>
        <Link to="/resources" className="text-brand-500 hover:underline">
          ← Back to Resources
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(resource.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const previewType = getPreviewType(resource.file_type);
  const canPreview = previewType !== 'none';

  /** Build the preview embed URL */
  const getPreviewUrl = () => {
    if (previewType === 'pdf') {
      return resource.file_url;
    }
    if (previewType === 'image') {
      return resource.file_url;
    }
    if (previewType === 'office') {
      // Use Microsoft Office Online Viewer for DOC/DOCX/PPT/PPTX
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.file_url)}`;
    }
    return '';
  };

  /** Render the preview content */
  const renderPreview = () => {
    if (previewType === 'image') {
      return (
        <div className="flex items-center justify-center bg-black/50 p-4 rounded-xl">
          <img
            src={resource.file_url}
            alt={resource.title}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      );
    }

    if (previewType === 'pdf') {
      return (
        <iframe
          src={`${resource.file_url}#toolbar=1&navpanes=1`}
          className="w-full rounded-xl border border-gold-border/20"
          style={{ height: fullscreen ? '90vh' : '600px' }}
          title={`Preview: ${resource.title}`}
        />
      );
    }

    if (previewType === 'office') {
      return (
        <iframe
          src={getPreviewUrl()}
          className="w-full rounded-xl border border-gold-border/20"
          style={{ height: fullscreen ? '90vh' : '600px' }}
          title={`Preview: ${resource.title}`}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 bg-transparent">
        {/* Back Link */}
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Resources
        </Link>

        {/* Main Card */}
        <div className="rounded-3xl border border-gold-border bg-surface-100 shadow-soft overflow-hidden">
          {/* File Preview Header */}
          <div className="bg-gradient-to-br from-brand-900/40 to-black p-8 flex items-center gap-5 border-b border-gold-border/50">
            <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl shadow-soft">
              <FileText className="h-10 w-10 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-400">{resource.file_type} • {formatFileSize(resource.file_size)}</p>
              <p className="text-xs font-medium text-gray-400 mt-1">{resource.file_name}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
              {resource.title}
            </h1>

            {resource.description && (
              <p className="text-gray-400 mb-8 leading-relaxed font-medium">
                {resource.description}
              </p>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {resource.subject && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Tag className="h-4 w-4 text-brand-500" />
                  <span>{resource.subject}</span>
                </div>
              )}
              {resource.semester && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <GraduationCap className="h-4 w-4 text-brand-500" />
                  <span>Semester {resource.semester}</span>
                </div>
              )}
              {resource.university && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Building className="h-4 w-4 text-brand-500" />
                  <span>{resource.university}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-8 border-t border-gold-border/30">
              <div className="flex items-center gap-6 text-sm font-semibold text-gray-400">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand-500" /> {resource.views ?? 0} views
                </span>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-brand-500" /> {resource.downloads ?? 0} downloads
                </span>
              </div>
              <div className="flex items-center gap-3">
                {canPreview && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] ${
                      showPreview
                        ? 'bg-surface-50 border border-brand-500/50 text-brand-400'
                        : 'bg-surface-50 border border-gold-border text-white hover:border-brand-500/50'
                    }`}
                  >
                    <Eye className="h-5 w-5" /> {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3.5 text-sm font-bold text-black shadow-gold-soft hover:shadow-gold transition-all duration-200 hover:scale-[1.02]"
                >
                  <Download className="h-5 w-5" /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Preview Panel */}
        {showPreview && canPreview && (
          <div className="mt-8 rounded-3xl border border-gold-border bg-surface-100 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gold-border/30 bg-[#0B0B0B]">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-bold text-white">Document Preview</span>
                <span className="text-xs text-gray-500 ml-2">
                  {previewType === 'office' ? 'Powered by Microsoft Office Viewer' : resource.file_type?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewType !== 'image' && (
                  <button
                    onClick={() => setFullscreen(true)}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-400 hover:bg-white/5 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Close Preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {renderPreview()}
            </div>
          </div>
        )}

        {/* Related Resources */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-white mb-8">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <ResourceCard key={r.id} {...r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Preview Overlay */}
      {fullscreen && showPreview && canPreview && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gold-border/20">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-bold text-white">{resource.title}</span>
              <span className="text-xs text-gray-500">{resource.file_type} • {formatFileSize(resource.file_size)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-sm font-bold text-brand-400 hover:bg-brand-500/20 transition-colors"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {renderPreview()}
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceDetail;
