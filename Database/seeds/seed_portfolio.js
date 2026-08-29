import dotenv from 'dotenv';
import pg from 'pg';
import { randomUUID } from 'crypto';

dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("❌ ERROR: Missing DATABASE_URL in .env");
  process.exit(1);
}

const dbClient = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

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

async function runSeed() {
  try {
    await dbClient.connect();
    console.log("✅ Connected to the database.");
    
    console.log("⏳ Fetching investor profiles...");
    const userRes = await dbClient.query(`
      SELECT id FROM public.profiles WHERE role = 'investor'
    `);
    
    const investorIds = userRes.rows.map(r => r.id);
    if (investorIds.length === 0) {
      console.log("ℹ️ No existing investors found. Run seed:investors first.");
      return;
    }

    console.log("⏳ Cleaning up existing portfolio data...");
    await dbClient.query(`DELETE FROM public.portfolio_investments`);
    
    console.log(`⏳ Seeding portfolio for ${investorIds.length} investors...`);
    
    const investmentsRows = [];
    const valuationRows = [];

    const mockCompanies = [
      { name: "FinAccel", stage: "Series C", sharePrice: 28.75, change: 8.4, revenue: 24700000, sentiment: "Bullish", val: 120000000, ownership: 18.7, invAmount: 20000000 },
      { name: "Healthify", stage: "Series B", sharePrice: 18.40, change: 5.2, revenue: 12300000, sentiment: "Bullish", val: 80000000, ownership: 12.5, invAmount: 10000000 },
      { name: "LogiNext", stage: "Series B", sharePrice: 21.10, change: -1.3, revenue: 9100000, sentiment: "Neutral", val: 65000000, ownership: 8.2, invAmount: 5330000 },
      { name: "KreditBee", stage: "Series D", sharePrice: 31.60, change: 12.7, revenue: 45200000, sentiment: "Bullish", val: 250000000, ownership: 5.4, invAmount: 13500000 },
      { name: "Uniphore", stage: "Series C", sharePrice: 16.90, change: -0.4, revenue: 8300000, sentiment: "Neutral", val: 55000000, ownership: 15.0, invAmount: 8250000 },
      { name: "Chargebee", stage: "Series D", sharePrice: 34.20, change: 3.1, revenue: 51800000, sentiment: "Strong Bullish", val: 300000000, ownership: 4.1, invAmount: 12300000 }
    ];

    for (const investorId of investorIds) {
      for (const comp of mockCompanies) {
        const invId = randomUUID();
        investmentsRows.push([
          invId,
          investorId,
          comp.name,
          comp.stage,
          comp.sharePrice,
          comp.change,
          comp.revenue,
          comp.sentiment,
          comp.val,
          comp.ownership,
          comp.invAmount
        ]);

        // Historical valuations for the line chart (matching the screenshot roughly: Seed $15M, Series A $40M, Series B $80M, etc.)
        let valMultiplier = 0.2;
        let monthsAgo = 30;
        const rounds = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D'];
        const stageIndex = rounds.indexOf(comp.stage);
        
        for (let i = 0; i <= stageIndex; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - monthsAgo);
          
          valuationRows.push([
            randomUUID(),
            invId,
            rounds[i],
            date.toISOString().split('T')[0],
            comp.val * valMultiplier
          ]);
          
          valMultiplier += 0.2;
          monthsAgo -= 6;
        }
      }
    }
    
    console.log("⏳ Bulk inserting portfolio investments...");
    await bulkInsert(dbClient, 'public.portfolio_investments', [
      'id', 'investor_profile_id', 'company_name', 'stage', 'implied_share_price', 
      'share_price_30d_change', 'run_rate_revenue', 'sentiment', 'valuation', 'ownership_percentage', 'investment_amount'
    ], investmentsRows);
    
    console.log("⏳ Bulk inserting valuation history...");
    await bulkInsert(dbClient, 'public.valuation_history', [
      'id', 'investment_id', 'round_name', 'round_date', 'valuation'
    ], valuationRows);
    
    console.log(`🎉 Successfully seeded portfolio data!`);
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await dbClient.end();
  }
}

runSeed();
