import { createClient } from '@supabase/supabase-js';

const url = 'https://lrsevtahcakdonjjwlep.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc2V2dGFoY2FrZG9uamp3bGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODAwOTIsImV4cCI6MjA5Njk1NjA5Mn0.EiYDYFizM421TSykjEvKnIg1VwuIK6-CjGol3kIl8zE';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('Tenant').select('*').limit(1);
  if (error) {
    console.error('ERROR reading Tenant:', error.message);
  } else {
    console.log('TENANTS FOUND:', data);
  }
}
test();
