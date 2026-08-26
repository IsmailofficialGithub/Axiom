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

const adjectives = [
  'Alpha', 'Apex', 'Aero', 'Aqua', 'Blue', 'Byte', 'Core', 'Cognitive', 'Cyber', 'Delta',
  'Eco', 'Elevate', 'Envision', 'Epic', 'Ever', 'Flow', 'Flux', 'Future', 'Genesis', 'Global',
  'Helix', 'Hyper', 'Infinity', 'Insight', 'Intel', 'Krypton', 'Legacy', 'Link', 'Logic', 'Matrix',
  'Meta', 'Micro', 'Nano', 'Nova', 'Omni', 'Optima', 'Orbit', 'Peak', 'Pinnacle', 'Pulse',
  'Quantum', 'Radical', 'Rapid', 'Sovereign', 'Spark', 'Spectrum', 'Synergy', 'Terra', 'Vector', 'Vortex'
];

const nouns = [
  'Labs', 'Systems', 'Technologies', 'Dynamics', 'Solutions', 'Networks', 'Analytics', 'Intelligence', 'Ventures', 'Software',
  'AI', 'Data', 'Digital', 'Scale', 'Link', 'Sync', 'Flow', 'Grid', 'Hub', 'Node',
  'Path', 'Pulse', 'Ridge', 'Rise', 'Shift', 'Source', 'Sphere', 'Stack', 'Stream', 'Wave',
  'Engine', 'Forge', 'Foundry', 'Hive', 'Loop', 'Mind', 'Net', 'Nexus', 'Space', 'Vault'
];

const industries = ['SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'E-commerce', 'CleanTech', 'EdTech', 'Cybersecurity', 'Web3', 'Logistics'];
const stages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C'];
const revenueModels = ['Subscription', 'Transactional', 'Marketplace', 'Advertising', 'Licensing'];
const fundUses = ['Product Development', 'Sales & Marketing', 'Team Expansion', 'Market Expansion', 'Operations'];

const generatedNames = new Set();
function generateUniqueCompanyName() {
  while (true) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const name = `${adj} ${noun}`;
    if (!generatedNames.has(name)) {
      generatedNames.add(name);
      return name;
    }
  }
}

function generateDescription(name, industry) {
  const templates = {
    'SaaS': [
      `Next-generation B2B SaaS platform optimizing enterprise workflows and team collaboration.`,
      `Cloud-native operations platform helping companies automate customer service at scale.`,
      `AI-powered subscription software streamlining business analytics and real-time reporting.`
    ],
    'Fintech': [
      `Decentralized payment infrastructure enabling seamless cross-border transactions for SMBs.`,
      `Automated wealth management and financial planning platform tailored for modern investors.`,
      `Smart billing and invoice management solutions powered by machine learning.`
    ],
    'Healthtech': [
      `Telehealth and patient monitoring platform improving remote clinical outcomes.`,
      `AI software for early detection of chronic diseases via radiological imaging.`,
      `Patient care coordination system optimizing hospital staff scheduling.`
    ],
    'AI/ML': [
      `Enterprise generative AI platform automating complex content and code generation.`,
      `Computer vision solutions optimizing quality control in automated manufacturing.`,
      `Predictive analytics engine helping retail companies forecast supply chain demand.`
    ],
    'E-commerce': [
      `D2C brand aggregator leveraging predictive analytics to scale digital storefronts.`,
      `Smart marketplace platform connecting local businesses directly with consumers.`,
      `AI-driven personalization engine increasing checkout conversion for e-retailers.`
    ],
    'CleanTech': [
      `IoT-enabled smart grid solutions optimizing renewable energy distribution.`,
      `Advanced carbon accounting and sustainability compliance reporting platform.`,
      `Next-generation battery management system extending electric vehicle range.`
    ],
    'EdTech': [
      `Immersive online learning platform teaching advanced technical skills.`,
      `AI teaching assistant automating grading and personalized student feedback.`,
      `Interactive learning management system for corporate compliance and training.`
    ],
    'Cybersecurity': [
      `Zero-trust network access platform securing distributed remote workforces.`,
      `Automated vulnerability assessment and cloud compliance monitoring suite.`,
      `Next-gen identity management and threat detection using behavioral biometrics.`
    ],
    'Web3': [
      `Secure digital asset custody and institutional-grade treasury management.`,
      `Privacy-preserving smart contract platform for enterprise supply chains.`,
      `Decentralized identity and access management protocol for secure web applications.`
    ],
    'Logistics': [
      `Autonomous fleet routing and dispatch optimization system for urban delivery.`,
      `Real-time cold chain monitoring and asset tracking platform for logistics.`,
      `Smart warehouse management system leveraging AI and robotics integration.`
    ]
  };

  const list = templates[industry] || templates['SaaS'];
  const baseDesc = list[Math.floor(Math.random() * list.length)];
  return `${name} is a ${baseDesc}`;
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

async function cleanExistingStartups(dbClient) {
  console.log("⏳ Cleaning up existing seeded startup data...");
  
  // 1. Get the list of user IDs for startup emails
  const userRes = await dbClient.query(`
    SELECT id FROM auth.users WHERE email LIKE 'startup%@user.com'
  `);
  
  const userIds = userRes.rows.map(r => r.id);
  if (userIds.length === 0) {
    console.log("ℹ️ No existing seeded startups found.");
    return;
  }

  console.log(`Deleting ${userIds.length} existing seeded startups...`);
  
  // Delete opportunities created by these users
  await dbClient.query(`
    DELETE FROM public.opportunities WHERE created_by = ANY($1::uuid[])
  `, [userIds]);

  // Delete companies referencing these profiles
  await dbClient.query(`
    DELETE FROM public.companies WHERE profile_id = ANY($1::uuid[])
  `, [userIds]);

  // Delete startups
  await dbClient.query(`
    DELETE FROM public.startups WHERE id = ANY($1::uuid[])
  `, [userIds]);

  // Delete profiles
  await dbClient.query(`
    DELETE FROM public.profiles WHERE id = ANY($1::uuid[])
  `, [userIds]);

  // Finally, delete from auth.users
  await dbClient.query(`
    DELETE FROM auth.users WHERE id = ANY($1::uuid[])
  `, [userIds]);

  console.log("✅ Cleanup complete.");
}

async function runSeed() {
  const TOTAL_STARTUPS = 1000;
  const BATCH_SIZE = 25; // Create auth users in parallel batches of 25
  const DEFAULT_PASSWORD = 'Password123!';
  
  try {
    await dbClient.connect();
    console.log("✅ Connected to the database.");
    
    // Clean up existing data first
    await cleanExistingStartups(dbClient);
    
    console.log(`⏳ Starting seeding process for ${TOTAL_STARTUPS} startups...`);
    
    const authUsersData = [];
    
    // 1. Create auth users in batches
    for (let i = 1; i <= TOTAL_STARTUPS; i += BATCH_SIZE) {
      const batchLimit = Math.min(i + BATCH_SIZE - 1, TOTAL_STARTUPS);
      const promises = [];
      
      for (let j = i; j <= batchLimit; j++) {
        const email = `startup${j}@user.com`;
        
        promises.push(
          supabase.auth.admin.createUser({
            email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
          }).then(res => {
            if (res.error) {
              console.error(`❌ Failed to create auth user ${email}:`, res.error.message);
              return null;
            }
            return { index: j, id: res.data.user.id, email };
          })
        );
      }
      
      const results = await Promise.all(promises);
      for (const res of results) {
        if (res) {
          authUsersData.push(res);
        }
      }
      
      console.log(`🚀 Created Auth Users progress: ${authUsersData.length}/${TOTAL_STARTUPS}`);
    }
    
    if (authUsersData.length === 0) {
      throw new Error("No auth users were created successfully.");
    }
    
    console.log("✅ All Auth Users created. Preparing profiles, startups, companies, and opportunities data...");
    
    const profilesRows = [];
    const startupsRows = [];
    const companiesRows = [];
    const opportunitiesRows = [];
    
    for (const userData of authUsersData) {
      const companyName = generateUniqueCompanyName();
      const phone = `555-0${String(userData.index).padStart(4, '0')}`; // Unique phone representation e.g. 555-00001
      
      // Profile Row
      profilesRows.push([
        userData.id,      // id
        'startup',        // role
        companyName,      // full_name
        phone,            // phone
        'active'          // status
      ]);
      
      // Startup details
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const arr = Math.floor(Math.random() * 5000000); // 0 to 5,000,000
      const lastYearRev = Math.max(0, arr - Math.floor(Math.random() * 1000000));
      const revModel = revenueModels[Math.floor(Math.random() * revenueModels.length)];
      const fundSought = Math.floor(Math.random() * 3000000) + 100000; // 100k to 3.1M
      const fundUse = fundUses[Math.floor(Math.random() * fundUses.length)];
      const prevFunding = Math.floor(Math.random() * 2000000);
      
      startupsRows.push([
        userData.id,      // id
        industry,         // industry
        stage,            // stage
        arr,              // current_arr
        lastYearRev,      // last_year_revenue
        revModel,         // revenue_model
        fundSought,       // funding_sought
        fundUse,          // primary_use_of_funds
        prevFunding,      // previous_funding
        JSON.stringify({}) // custom_qa
      ]);
      
      // Company details (explicit UUID)
      const companyId = randomUUID();
      const description = generateDescription(companyName, industry);
      const website = `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`;
      
      companiesRows.push([
        companyId,        // id
        userData.id,      // profile_id
        null,             // subsidiary_id
        companyName,      // company_name
        industry,         // industry
        description,      // description
        website,          // website
        stage             // stage
      ]);
      
      // Opportunity details (explicit UUID)
      const opportunityId = randomUUID();
      opportunitiesRows.push([
        opportunityId,    // id
        companyId,        // company_id
        null,             // subsidiary_id
        `${companyName} Capital Placement`, // title
        industry,         // category
        "Live capital placement opportunity on Axiomra.", // description
        fundSought,       // expected_revenue
        'USD',            // currency
        stage,            // stage
        'published',      // status
        userData.id       // created_by
      ]);
    }
    
    // 2. Bulk insert Profiles
    console.log("⏳ Bulk inserting profiles...");
    await bulkInsert(dbClient, 'public.profiles', ['id', 'role', 'full_name', 'phone', 'status'], profilesRows);
    
    // 3. Bulk insert Startups
    console.log("⏳ Bulk inserting startup details...");
    await bulkInsert(dbClient, 'public.startups', [
      'id', 'industry', 'stage', 'current_arr', 'last_year_revenue', 'revenue_model', 'funding_sought', 'primary_use_of_funds', 'previous_funding', 'custom_qa'
    ], startupsRows);
    
    // 4. Bulk insert Companies
    console.log("⏳ Bulk inserting companies...");
    await bulkInsert(dbClient, 'public.companies', [
      'id', 'profile_id', 'subsidiary_id', 'company_name', 'industry', 'description', 'website', 'stage'
    ], companiesRows);
    
    // 5. Bulk insert Opportunities
    console.log("⏳ Bulk inserting opportunities...");
    await bulkInsert(dbClient, 'public.opportunities', [
      'id', 'company_id', 'subsidiary_id', 'title', 'category', 'description', 'expected_revenue', 'currency', 'stage', 'status', 'created_by'
    ], opportunitiesRows);
    
    console.log(`🎉 Successfully seeded ${authUsersData.length} startups and their details!`);
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await dbClient.end();
  }
}

runSeed();
