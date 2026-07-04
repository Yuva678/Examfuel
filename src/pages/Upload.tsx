import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, FileText, Image, Archive, Presentation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/** Allowed MIME types mapped to friendly labels */
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WEBP',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Electronics', 'Mechanical', 'Civil', 'Electrical', 'English',
  'Business', 'Economics',
  'Biology for Engineers', 'Microcontroller and Embedded Systems',
  'Analysis and Design of Algorithms', 'Database Management System',
  'Professional Skills for the Work Place', 'Algorithms Lab',
  'Yoga', 'Universal human values course', 'Object Oriented Programming with Python',
  'PROCTOR-CSE', 'CLUB ACTIVITIES',
  'Other',
];

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const RESOURCE_TYPES = ['Notes', 'Past Paper', 'Assignment', 'Lab Manual', 'Cheatsheet', 'Slides', 'Other'];

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [university, setUniversity] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Validate the selected file against allowed types and size */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES[selected.type]) {
      setError(`File type "${selected.type}" is not supported. Allowed: PDF, DOCX, PPT, PPTX, Images, ZIP.`);
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50 MB limit.');
      return;
    }

    setError(null);
    setFile(selected);

    // Auto-fill title from file name if title is empty
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** Upload file to Supabase Storage, then insert metadata into the resources table */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload file to Storage
      // Path pattern: userId/timestamp_filename — ensures uniqueness and lets RLS identify the owner
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // 3. Insert resource metadata into the database
      const { error: insertError } = await supabase.from('resources').insert({
        title,
        description,
        subject,
        semester,
        university,
        resource_type: resourceType,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: ALLOWED_TYPES[file.type] || file.type,
        uploaded_by: user.id,
      });

      if (insertError) throw insertError;

      // Success — redirect to the resources page
      navigate('/resources');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  /** Get icon based on file type */
  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-green-400" />;
    if (file.type.includes('presentation') || file.type.includes('powerpoint'))
      return <Presentation className="h-8 w-8 text-orange-400" />;
    if (file.type.includes('zip')) return <Archive className="h-8 w-8 text-yellow-400" />;
    return <FileText className="h-8 w-8 text-blue-400" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="bg-surface-100 rounded-3xl border border-gold-border p-8 md:p-12 shadow-soft">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Upload Resource</h1>
        <p className="text-gray-400 mb-8 font-medium">
          Share study materials with the community. All uploads are public.
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 border border-red-500/20">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-gold-border p-8 text-center hover:border-brand-500 transition-colors bg-black"
          >
            {file ? (
              <div className="flex items-center justify-center gap-4">
                {getFileIcon()}
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs font-medium text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="ml-4 p-2 rounded-full hover:bg-surface-50 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <UploadIcon className="mx-auto h-12 w-12 text-brand-500 mb-4" />
                <p className="mt-2 text-sm font-medium text-gray-400">
                  Click to select a file (PDF, DOCX, PPT, Images, ZIP — max 50 MB)
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
              placeholder="e.g. Data Structures Unit 3 Notes"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
              placeholder="Brief description of the resource..."
            />
          </div>

          {/* Subject + Semester Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
              >
                <option value="" className="text-gray-500">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-semibold text-gray-300 mb-2">
                Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
              >
                <option value="" className="text-gray-500">Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* University + Resource Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="university" className="block text-sm font-semibold text-gray-300 mb-2">
                University
              </label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
                placeholder="e.g. VIT University"
              />
            </div>

            <div>
              <label htmlFor="resource-type" className="block text-sm font-semibold text-gray-300 mb-2">
                Resource Type
              </label>
              <select
                id="resource-type"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="block w-full rounded-xl border border-gold-border bg-black px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all"
              >
                <option value="" className="text-gray-500">Select type</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4 text-base font-bold text-black shadow-gold-soft hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
            >
              <UploadIcon className="h-5 w-5" />
              {uploading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
