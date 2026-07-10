"use client";
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  FileCheck2,
  Search,
  Upload,
  FileImage,
  FileText,
  Download,
  Trash2
} from 'lucide-react';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // Keep in sync with the server limit

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip "data:...;base64," prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Documents() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    }
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataBase64 = await fileToBase64(file);
      return api.post('/documents', {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataBase64,
        jobId: selectedJobId || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadError('');
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.error || 'Upload failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] })
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setUploadError('File is too large (max 10 MB)');
      return;
    }
    uploadMutation.mutate(file);
    e.target.value = ''; // allow re-uploading the same file
  };

  const handleDownload = async (doc: any) => {
    const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter((d: any) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.job?.vehicle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.job?.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Files</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <FileCheck2 size={24} className="text-zinc-400" />
            Document Center
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 pl-10 pr-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none w-64"
            />
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
          >
            <option value="">No job (general)</option>
            {jobs.map((job: any) => (
              <option key={job.id} value={job.id}>
                {job.vehicle} — {job.customer}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </header>

      {uploadError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading documents...</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">File Name</th>
                <th className="px-6 py-4 font-medium">Associated Job</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Date Uploaded</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No documents yet. Upload estimates, photos, or signed authorizations.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          doc.mimeType?.startsWith('image/')
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {doc.mimeType?.startsWith('image/') ? <FileImage size={16} /> : <FileText size={16} />}
                        </div>
                        <span className="text-zinc-50 font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {doc.job ? `${doc.job.vehicle} — ${doc.job.customer}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 rounded transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(doc.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900/50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
