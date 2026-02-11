require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking configuration...');
if (!supabaseUrl) {
    console.error('❌ Error: SUPABASE_URL is missing from .env');
    process.exit(1);
}
if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env');
    process.exit(1);
}

console.log(`Target Project: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Testing connection...');

    try {
        // Attempt 1: List buckets (usually works even with empty DB)
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.log('⚠️ Storage check failed:', bucketError.message);
        } else {
            console.log('✅ Storage check passed. Buckets found:', buckets.length);
        }

        // Attempt 2: Check for 'bookings' table
        const { data, error } = await supabase.from('bookings').select('*').limit(1);

        if (error) {
            console.log(`ℹ️ Table check result: ${error.message} (Code: ${error.code})`);
            if (error.code === '42P01' || error.message.includes('relation "public.bookings" does not exist')) {
                console.log('✅ Connection Sucessful! Database is accessible, but "bookings" table is missing (expected).');
            } else {
                console.log('❌ Unexpected error accessing table. Connection might still be valid depending on RLS.');
            }
        } else {
            console.log('✅ "bookings" table exists and is accessible.');
        }

    } catch (err) {
        console.error('❌ CRITICAL FAILURE:', err);
    }
}

verify();
