const axios = require('axios');
require('dotenv').config();
async function test() {
  const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  console.log(res.data.models.map(m => m.name).join(', '));
}
test();
