import { createClient } from '@supabase/supabase-js';

const url = 'https://lrsevtahcakdonjjwlep.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc2V2dGFoY2FrZG9uamp3bGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODAwOTIsImV4cCI6MjA5Njk1NjA5Mn0.EiYDYFizM421TSykjEvKnIg1VwuIK6-CjGol3kIl8zE';
const supabase = createClient(url, key);

async function checkSchema() {
  // Try to find an existing Job first to avoid inserting
  const { data: existingJobs } = await supabase.from('Job').select('*').limit(1);
  if (existingJobs && existingJobs.length > 0) {
    console.log("== JOB TABLE SCHEMA ==");
    console.log(Object.keys(existingJobs[0]).join('\n'));
    return;
  }

  // If table is empty, we must insert to get the schema
  const { data: tenant } = await supabase.from('Tenant').select('id').limit(1).single();
  const tenantId = tenant?.id || crypto.randomUUID(); // Fallback if Tenant RLS is enabled

  const now = new Date().toISOString();
  const { data, error } = await supabase.from('Job').insert([{
      id: crypto.randomUUID(),
      tenantId: tenantId,
      createdAt: now,
      updatedAt: now,
      vehicle: 'Schema Check',
      customer: 'Schema Tester',
      status: 'Intake'
  }]).select();

  if (error) {
    console.error("Failed to fetch schema due to error:", error.message);
  } else if (data && data[0]) {
    console.log("== JOB TABLE SCHEMA ==");
    console.log(Object.keys(data[0]).join('\n'));
    await supabase.from('Job').delete().eq('id', data[0].id);
  }
}

checkSchema();
