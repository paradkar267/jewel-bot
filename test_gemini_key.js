const axios = require('axios');
const apiKey = "REPLACE_WITH_YOUR_KEY";

async function test() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: "hello" }] }]
      }
    );
    console.log("SUCCESS:", response.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}
test();
