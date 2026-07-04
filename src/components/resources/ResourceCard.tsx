import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, FileText, Image, Archive, Presentation, Calendar } from 'lucide-react';

interface ResourceCardProps {
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

/** Returns an icon and background color based on file type */
const getFileIcon = (fileType: string | null) => {
  const type = (fileType || '').toUpperCase();
  if (['PNG', 'JPEG', 'WEBP', 'JPG'].includes(type))
    return { icon: <Image className="h-6 w-6" />, bg: 'bg-green-500/10 text-green-500' };
  if (['PPT', 'PPTX'].includes(type))
    return { icon: <Presentation className="h-6 w-6" />, bg: 'bg-orange-500/10 text-orange-500' };
  if (['ZIP'].includes(type))
    return { icon: <Archive className="h-6 w-6" />, bg: 'bg-yellow-500/10 text-yellow-500' };
  return { icon: <FileText className="h-6 w-6" />, bg: 'bg-blue-500/10 text-blue-500' };
};

const ResourceCard = ({
  id,
  title,
  subject,
  semester,
  resource_type,
  file_type,
  downloads,
  views,
  created_at,
}: ResourceCardProps) => {
  const { icon, bg } = getFileIcon(file_type);
  const formattedDate = new Date(created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group rounded-2xl border border-gold-border bg-surface-100 hover:border-brand-500/50 shadow-soft hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
      <Link to={`/resources/${id}`} className="block p-6">
        {/* Header: Icon + Type Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
          {resource_type && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {resource_type}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {title}
        </h3>

        {/* Tags: Subject + Semester */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subject && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-50 text-gray-400 border border-white/5">
              {subject}
            </span>
          )}
          {semester && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-50 text-gray-400 border border-white/5">
              Sem {semester}
            </span>
          )}
        </div>

        {/* Footer: Date + Stats */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 pt-4 border-t border-gold-border/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {views ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" /> {downloads ?? 0}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default React.memo(ResourceCard);
