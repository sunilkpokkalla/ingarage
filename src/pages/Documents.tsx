import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  FileCheck2,
  Search,
  Upload,
  FileImage,
  FileText,
  FileSignature,
  Download
} from 'lucide-react';

export default function Documents() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Mock some documents for the existing jobs
  const documents = jobs.flatMap((job: any) => [
    { id: `${job.id}-1`, name: 'Intake Photos.pdf', type: 'image', size: '2.4 MB', date: job.createdAt, job: job.vehicle },
    { id: `${job.id}-2`, name: 'Initial Estimate.pdf', type: 'doc', size: '145 KB', date: job.createdAt, job: job.vehicle },
    { id: `${job.id}-3`, name: 'Customer Authorization.pdf', type: 'sign', size: '890 KB', date: job.createdAt, job: job.vehicle },
  ]);

  const filteredDocs = documents.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.job.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button 
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={() => alert("File upload simulated.")}
          >
            <Upload size={18} />
            Upload File
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading documents...</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/50/50 text-zinc-400 uppercase text-xs border-b border-zinc-800">
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
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-zinc-900/50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          doc.type === 'image' ? 'bg-blue-500/10 text-blue-400' :
                          doc.type === 'sign' ? 'bg-brand-500/10 text-brand-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {doc.type === 'image' && <FileImage size={16} />}
                          {doc.type === 'doc' && <FileText size={16} />}
                          {doc.type === 'sign' && <FileSignature size={16} />}
                        </div>
                        <span className="text-zinc-50 font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {doc.job}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 rounded transition-colors">
                        <Download size={18} />
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
