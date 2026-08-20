const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_AKDmo8YvxIC9@ep-flat-flower-ayuzyru2-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT id, name, gold_rate_per_gram, silver_rate_per_gram FROM "shops"');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
main().catch(console.error);
