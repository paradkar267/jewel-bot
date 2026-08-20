const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_AKDmo8YvxIC9@ep-flat-flower-ayuzyru2-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT id, name, gold_rate_per_gram FROM "shops"');
  for (const row of res.rows) {
    if (row.gold_rate_per_gram) {
      const currentRate = parseFloat(row.gold_rate_per_gram);
      const newRate = Math.round(currentRate * 24 / 22);
      console.log(`Updating ${row.name}: ${currentRate} -> ${newRate}`);
      await client.query('UPDATE "shops" SET gold_rate_per_gram = $1 WHERE id = $2', [newRate, row.id]);
    }
  }
  console.log("Done updating!");
  await client.end();
}
main().catch(console.error);
