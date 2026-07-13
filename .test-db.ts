import { createClient } from '@supabase/supabase-js';

const url = 'https://lrsevtahcakdonjjwlep.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc2V2dGFoY2FrZG9uamp3bGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODAwOTIsImV4cCI6MjA5Njk1NjA5Mn0.EiYDYFizM421TSykjEvKnIg1VwuIK6-CjGol3kIl8zE';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('Job').insert([{
      vehicle: 'Diagnostic Test',
      customer: 'Test',
      vin: '12345678901234567',
      insurer: 'Test',
      status: 'Intake',
      phone: 'Test',
      email: 'Test',
      year: 'Test',
      make: 'Test',
      model: 'Test',
      license_plate: 'Test'
  }]).select();
  
  if (error) {
    console.error('\n❌ DATABASE ERROR:', error.message);
  } else {
    console.log('\n✅ SUCCESS: Other columns exist!');
    if (data && data[0]) {
      await supabase.from('Job').delete().eq('id', data[0].id);
    }
  }
}
test();
