"use client";
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Timer,
  Play,
  Square,
  Clock,
  User,
  BarChart,
  Activity
} from 'lucide-react';

export default function Labor() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Job').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['technicianEfficiency'],
    queryFn: async () => {
      const { data, error } = await supabase.from('User').select('*, timeLogs:TimeLog(startTime, endTime)');
      if (error) throw error;
      return data;
    }
  });

  // Calculate efficiency
  const techStats = users.map((u: any) => {
    const logs = u.timeLogs || [];
    let totalMs = 0;
    logs.forEach((log: any) => {
      if (log.startTime && log.endTime) {
        totalMs += new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
      }
    });
    const hours = totalMs / (1000 * 60 * 60);
    return {
      name: u.name || u.email,
      hours: hours.toFixed(2),
      efficiency: hours > 0 ? Math.min(100, Math.round((hours / 40) * 100)) : 0
    };
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const getUserRecord = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) throw new Error('You must be logged in to track time.');
    const { data: userRecord, error } = await supabase
      .from('User')
      .select('id, hourlyRate')
      .eq('email', session.user.email)
      .maybeSingle();
    if (error) throw error;
    if (!userRecord) throw new Error('No technician record found for your account. Ask your manager to invite you in Settings.');
    return userRecord;
  };

  // Restore an open clock-in after a page reload
  useEffect(() => {
    const restore = async () => {
      try {
        const userRecord = await getUserRecord();
        const { data: openLog } = await supabase
          .from('TimeLog')
          .select('jobId')
          .eq('userId', userRecord.id)
          .is('endTime', null)
          .order('startTime', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (openLog) setActiveJobId(openLog.jobId);
      } catch {
        // Not logged in or no technician record — nothing to restore
      }
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClockIn = async (jobId: string) => {
    try {
      const userRecord = await getUserRecord();
      const now = new Date().toISOString();
      const activeTenantId = user?.tenantId || 'cmr4vjp1q0000aluvn85iirke';
      const { error } = await supabase.from('TimeLog').insert([{
        id: crypto.randomUUID(),
        tenantId: activeTenantId,
        createdAt: now,
        updatedAt: now,
        jobId,
        userId: userRecord.id,
        laborRate: userRecord.hourlyRate || 0,
        startTime: now
      }]);
      if (error) throw error;
      setActiveJobId(jobId);
      queryClient.invalidateQueries({ queryKey: ['technicianEfficiency'] });
    } catch (err: any) {
      console.error(err);
      alert('Failed to clock in: ' + err.message);
    }
  };

  const handleClockOut = async (jobId: string) => {
    try {
      const userRecord = await getUserRecord();
      const { data: log, error: logError } = await supabase
        .from('TimeLog')
        .select('id, startTime')
        .eq('jobId', jobId)
        .eq('userId', userRecord.id)
        .is('endTime', null)
        .order('startTime', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (logError) throw logError;

      const now = new Date().toISOString();
      if (log) {
        const { error: updateError } = await supabase
          .from('TimeLog')
          .update({ endTime: now, updatedAt: now })
          .eq('id', log.id);
        if (updateError) throw updateError;

        // Accrue the elapsed time onto the job so labor totals stay accurate
        const elapsedHours = (new Date(now).getTime() - new Date(log.startTime).getTime()) / (1000 * 60 * 60);
        const job = jobs.find((j: any) => j.id === jobId);
        const { error: jobError } = await supabase
          .from('Job')
          .update({
            laborHours: Math.round(((job?.laborHours || 0) + elapsedHours) * 100) / 100,
            updatedAt: now
          })
          .eq('id', jobId);
        if (jobError) throw jobError;
      }
      setActiveJobId(null);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['technicianEfficiency'] });
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

      {/* Technician Efficiency Dashboard */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2 mb-6">
          <Activity className="text-brand-500" size={20} />
          Technician Efficiency Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStats.map((tech: any, i: number) => (
            <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-zinc-200 truncate pr-2">{tech.name}</h3>
                <span className="text-brand-400 font-mono font-bold">{tech.hours}h</span>
              </div>
              <div className="text-xs text-zinc-500 mb-1 flex justify-between">
                <span>Weekly Utilization</span>
                <span>{tech.efficiency}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-500 h-2 rounded-full" 
                  style={{ width: `${tech.efficiency}%` }}
                ></div>
              </div>
            </div>
          ))}
          {techStats.length === 0 && (
            <div className="col-span-full text-center text-zinc-500 py-4">
              No technicians found or no hours logged yet.
            </div>
          )}
        </div>
      </div>

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
