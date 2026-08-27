import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';
import { randomUUID } from 'crypto';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error("❌ ERROR: Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dbClient = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Isabella', 'Michael', 'Mia', 'Alexander', 'Charlotte'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const firms = ['Capital', 'Ventures', 'Partners', 'Holdings', 'Group', 'Investments', 'Fund', 'Equity'];

const industries = ['SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'E-commerce', 'CleanTech', 'EdTech', 'Cybersecurity', 'Web3', 'Logistics'];

function generateName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function generateFirmName(lastName) {
  const firm = firms[Math.floor(Math.random() * firms.length)];
  return `${lastName} ${firm}`;
}

async function bulkInsert(client, tableName, columns, rows) {
  if (rows.length === 0) return;
  const colNames = columns.join(', ');
  const placeholders = [];
  const flatValues = [];
  let paramIndex = 1;
  
  for (const row of rows) {
    const rowPlaceholders = [];
    for (let i = 0; i < columns.length; i++) {
      rowPlaceholders.push(`$${paramIndex++}`);
      flatValues.push(row[i]);
    }
    placeholders.push(`(${rowPlaceholders.join(', ')})`);
  }
  
  const queryText = `INSERT INTO ${tableName} (${colNames}) VALUES ${placeholders.join(', ')}`;
  await client.query(queryText, flatValues);
}

async function cleanExistingInvestors(dbClient) {
  console.log("⏳ Cleaning up existing seeded investor data...");
  
  const userRes = await dbClient.query(`
    SELECT id FROM auth.users WHERE email LIKE 'investor%@user.com'
  `);
  
  const userIds = userRes.rows.map(r => r.id);
  if (userIds.length === 0) {
    console.log("ℹ️ No existing seeded investors found.");
    return;
  }

  console.log(`Deleting ${userIds.length} existing seeded investors...`);
  
  await dbClient.query(`
    DELETE FROM public.investors WHERE profile_id = ANY($1::uuid[])
  `, [userIds]);

  await dbClient.query(`
    DELETE FROM public.profiles WHERE id = ANY($1::uuid[])
  `, [userIds]);

  await dbClient.query(`
    DELETE FROM auth.users WHERE id = ANY($1::uuid[])
  `, [userIds]);

  console.log("✅ Cleanup complete.");
}

async function runSeed() {
  const TOTAL_INVESTORS = 5;
  const DEFAULT_PASSWORD = 'Password123!';
  
  try {
    await dbClient.connect();
    console.log("✅ Connected to the database.");
    
    await cleanExistingInvestors(dbClient);
    
    console.log(`⏳ Starting seeding process for ${TOTAL_INVESTORS} investors...`);
    
    const authUsersData = [];
    
    for (let i = 1; i <= TOTAL_INVESTORS; i++) {
      const email = `investor${i}@user.com`;
      
      const res = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });

      if (res.error) {
        console.error(`❌ Failed to create auth user ${email}:`, res.error.message);
      } else {
        authUsersData.push({ index: i, id: res.data.user.id, email });
      }
    }
    
    if (authUsersData.length === 0) {
      throw new Error("No auth users were created successfully.");
    }
    
    console.log("✅ All Auth Users created. Preparing profiles and investors data...");
    
    const profilesRows = [];
    const investorsRows = [];
    
    for (const userData of authUsersData) {
      const fullName = generateName();
      const lastName = fullName.split(' ')[1];
      const firmName = generateFirmName(lastName);
      const phone = `555-1${String(userData.index).padStart(3, '0')}`;
      
      profilesRows.push([
        userData.id,      
        'investor',       
        fullName,         
        phone,            
        'active'          
      ]);
      
      const investmentMin = Math.floor(Math.random() * 400000) + 100000; // 100k to 500k
      const investmentMax = investmentMin + Math.floor(Math.random() * 4500000) + 500000; // up to 5M more
      
      // Select 3 random preferred industries
      const shuffledIndustries = [...industries].sort(() => 0.5 - Math.random());
      const preferred = shuffledIndustries.slice(0, 3);
      
      const investorId = randomUUID();
      investorsRows.push([
        investorId,
        userData.id,
        investmentMin,
        investmentMax,
        `{${preferred.map(i => `"${i}"`).join(',')}}`, // Postgres array syntax
        'verified' // kyc_status
      ]);
    }
    
    console.log("⏳ Bulk inserting profiles...");
    await bulkInsert(dbClient, 'public.profiles', ['id', 'role', 'full_name', 'phone', 'status'], profilesRows);
    
    console.log("⏳ Bulk inserting investors details...");
    await bulkInsert(dbClient, 'public.investors', [
      'id', 'profile_id', 'investment_min', 'investment_max', 'preferred_industries', 'kyc_status'
    ], investorsRows);
    
    console.log(`🎉 Successfully seeded ${authUsersData.length} investors and their details!`);
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await dbClient.end();
  }
}

runSeed();
