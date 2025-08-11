const { MongoClient , ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://dchin243:vywgM8PMD9ZOwcCK@cluster0.lyxhd6q.mongodb.net/trustpilot?retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    // Try with minimal options first
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('📡 Attempting to connect...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    const db = client.db('trustpilot');
    const collection = db.collection('feedbacks');
    
    const count = await collection.countDocuments();
    console.log(`�� Document count: ${count}`);
    
    await client.close();
    console.log('🔌 Connection closed.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n💡 This is a Windows SSL issue. Solutions:');
      console.log('1. Use file storage for development (recommended)');
      console.log('2. Deploy to production where SSL works');
      console.log('3. Try using a VPN or different network');
    }
  }
}

testConnection();