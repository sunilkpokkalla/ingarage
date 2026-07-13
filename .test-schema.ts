import { createClient } from '@supabase/supabase-js';

const url = 'https://lrsevtahcakdonjjwlep.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc2V2dGFoY2FrZG9uamp3bGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODAwOTIsImV4cCI6MjA5Njk1NjA5Mn0.EiYDYFizM421TSykjEvKnIg1VwuIK6-CjGol3kIl8zE';
const supabase = createClient(url, key);

async function test() {
  console.log('Inserting minimal row to retrieve full schema...');
  const { data, error } = await supabase.from('Job').insert([{
      vehicle: 'Diagnostic Schema Check',
      customer: 'Schema Tester',
      status: 'Intake'
  }]).select();
  
  if (error) {
    console.error('\n❌ ERROR:', error.message);
  } else if (data && data[0]) {
    console.log('\n✅ ROW INSERTED. Here are all the columns the API can see in the Job table:');
    console.log(Object.keys(data[0]).map(k => ` - ${k}`).join('\n'));
    
    // Cleanup
    await supabase.from('Job').delete().eq('id', data[0].id);
    console.log('\n(Test row deleted automatically)');
  }
}
test();
