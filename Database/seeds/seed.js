import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error("❌ ERROR: Missing Supabase credentials or DATABASE_URL in .env");
  process.exit(1);
}

// 1. Supabase Admin Client (To create Auth Users)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 2. PG Client (To insert direct DB rows easily if needed)
const { Client } = pg;
const dbClient = new Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function runSeed() {
  try {
    await dbClient.connect();
    console.log("✅ Connected to the database.");

    // ==========================================
    // 1. Create Admin User (Auth)
    // ==========================================
    console.log("⏳ Creating Admin user...");
    const adminEmail = 'admin@frima.com';
    const adminPassword = 'AdminPassword123!';
    
    let { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError && authError.message.includes('already registered')) {
        console.log(`⚠️ Admin user ${adminEmail} already exists. Skipping Auth creation.`);
        // Note: In a real scenario we might fetch the user, but for seeding simplicity we'll assume the profile is there.
    } else if (authError) {
      throw authError;
    } else {
      console.log(`✅ Admin user created (Auth ID: ${authUser.user.id})`);

      // ==========================================
      // 2. Create Admin Profile
      // ==========================================
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          role: 'admin',
          full_name: 'System Admin',
          status: 'active'
        });

      if (profileError) throw profileError;
      console.log(`✅ Admin profile created`);
      
      // ==========================================
      // 3. Create Sample Subsidiary
      // ==========================================
      const { data: subData, error: subError } = await supabase
        .from('subsidiaries')
        .insert({
          name: 'FRIMA Ventures',
          description: 'Venture Capital division of FRIMA',
          created_by: authUser.user.id
        })
        .select('id')
        .single();
        
      if (subError) throw subError;
      console.log(`✅ Dummy Subsidiary created (ID: ${subData.id})`);
    }

    console.log("🎉 Seeding completed successfully!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await dbClient.end();
  }
}

runSeed();
