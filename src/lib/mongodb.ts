import { MongoClient, ServerApiVersion } from 'mongodb';

// Check for MongoDB connection configuration
let uri: string;

// Check if using new credential-based configuration
if (process.env.MONGODB_URI) {
  // Fallback to legacy MONGODB_URI format
  uri = process.env.MONGODB_URI;
} else {
  throw new Error('Invalid/Missing MongoDB configuration. Please set either MONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORD or MONGODB_URI');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(() => {
        console.log('✅ MongoDB connected successfully (development)');
        return client;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed (development):', error.message);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(uri);
  clientPromise = client.connect()
    .then(() => {
      console.log('✅ MongoDB connected successfully (production)');
      return client;
    })
    .catch((error) => {
      console.error('❌ MongoDB connection failed (production):', error.message);
      throw error;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  const database = process.env.MONGODB_DATABASE || 'trustpilot';
  return client.db(database);
}

export async function getFeedbacksCollection() {
  const db = await getDatabase();
  return db.collection('feedbacks');
}
