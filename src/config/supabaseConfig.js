require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('--- SUPABASE CONFIGURATION ---');
console.log('URL:', supabaseUrl);
console.log('Key Configured:', !!supabaseKey);
console.log('------------------------------');

supabase.checkConnection = async () => {
    try {
        console.log('🔄 Testing Supabase connection...');
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('❌ Supabase Connection Failed:', error.message);
        } else {
            console.log('✅ Supabase Connected Successfully!');
        }
    } catch (err) {
        console.error('❌ Supabase Connection Error:', err.message);
    }
};

module.exports = supabase;
