const axios = require('axios');

async function testWebhook() {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '1234567890',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '1234567890',
            phone_number_id: '1234567890'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: '1234567890'
          }],
          messages: [{
            from: '1234567890',
            id: 'wamid.123',
            timestamp: '1234567890',
            type: 'image',
            image: {
              mime_type: 'image/jpeg',
              sha256: 'abcd',
              id: '12345' // Fake image ID
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const response = await axios.post('http://localhost:3002/webhook', payload);
    console.log('Webhook Response:', response.data);
  } catch (error) {
    console.error('Webhook Error:', error.message);
  }
}

testWebhook();
