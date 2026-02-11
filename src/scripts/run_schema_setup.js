require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Helper to construct connection string
const constructConnectionString = () => {
    // If DATABASE_URL is explicitly set, use it
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

    // Otherwise construct from Supabase credentials
    // Format: postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
    // Note: PASSWORD is often NOT in .env, user might need to provide it or set DATABASE_URL
    const host = process.env.SUPABASE_HOST || 'db.nhqbdionvlxygyecseww.supabase.co';
    const password = process.env.SUPABASE_PASSWORD || process.env.DB_PASSWORD;
    
    if (!password) {
        console.error("❌ ERROR: Missing DB Password. Please set DATABASE_URL or SUPABASE_PASSWORD in .env");
        process.exit(1);
    }

    return `postgres://postgres:${password}@${host}:5432/postgres`;
};

async function runMigration() {
    const connectionString = constructConnectionString();
    console.log(`Connecting to database...`);
    
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log("✅ Connected to Postgres");

        const sqlPath = path.join(__dirname, 'setup_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Executing schema setup...");
        await client.query(sql);
        console.log("✅ Schema setup completed successfully!");

    } catch (err) {
        console.error("❌ MIGRATION FAILED:", err);
    } finally {
        await client.end();
    }
}

runMigration();
