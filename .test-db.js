const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('Job').select('*').limit(1);
  console.log('Error:', error);
  if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    console.log('No data found, but request succeeded if error is null');
  }
}
test();
