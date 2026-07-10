"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import {
  Timer,
  Play,
  Square,
  Clock,
  User,
} from 'lucide-react';

export default function Labor() {
  const supabase = createClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Job').select('*');
      if (error) throw error;
      return data;
    }
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleClockIn = async (jobId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data: userRecord } = await supabase.from('User').select('id, hourlyRate').eq('email', session.user.email).single();
        if (userRecord) {
          await supabase.from('TimeLog').insert([{
            jobId,
            userId: userRecord.id,
            laborRate: userRecord.hourlyRate || 0,
            startTime: new Date().toISOString()
          }]);
        }
      }
      setActiveJobId(jobId);
    } catch (err: any) {
      console.error(err);
      alert('Failed to clock in: ' + err.message);
    }
  };

  const handleClockOut = async (jobId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data: userRecord } = await supabase.from('User').select('id').eq('email', session.user.email).single();
        if (userRecord) {
          const { data: log } = await supabase
            .from('TimeLog')
            .select('id')
            .eq('jobId', jobId)
            .eq('userId', userRecord.id)
            .is('endTime', null)
            .maybeSingle();
            
          if (log) {
            await supabase.from('TimeLog').update({ endTime: new Date().toISOString() }).eq('id', log.id);
          }
        }
      }
      setActiveJobId(null);
    } catch (err: any) {
      console.error(err);
      alert('Failed to clock out: ' + err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Timesheets</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Timer size={24} className="text-zinc-400" />
            Labor Tracking
          </h1>
        </div>
        <div className="bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 flex items-center gap-3">
          <User size={18} className="text-zinc-400" />
          <span className="text-zinc-50 font-medium">Technician View</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job: any) => {
          const isClockedIn = activeJobId === job.id;
          
          return (
            <div key={job.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-50">{job.vehicle}</h3>
                    <p className="text-zinc-400 text-sm">{job.customer}</p>
                  </div>
                  <span className="text-brand-400 font-mono text-sm bg-brand-500/10 px-2 py-1 rounded">
                    {job.laborHours}h logged
                  </span>
                </div>
                <div className="text-sm text-zinc-400 mb-6 flex items-center gap-2">
                  <Clock size={16} /> Current status: {job.status}
                </div>
              </div>
              
              <div className="border-t border-zinc-800 pt-4 flex justify-end gap-3">
                {isClockedIn ? (
                  <button 
                    onClick={() => handleClockOut(job.id)}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl font-bold transition-colors w-full justify-center"
                  >
                    <Square size={18} fill="currentColor" />
                    Clock Out
                  </button>
                ) : (
                  <button 
                    onClick={() => handleClockIn(job.id)}
                    disabled={activeJobId !== null}
                    className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition-colors w-full justify-center"
                  >
                    <Play size={18} fill="currentColor" />
                    Clock In
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
