const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${host}:${port}/${database}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.connection = this.client.connect((err) => {
      if (err) {
        console.error('Failed to connect to MongoDB:', err);
      } else {
        console.log('Connected successfully to MongoDB');
        this.users = this.client.db().collection('users');
        this.files = this.client.db().collection('files');
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    await this.connection;
    return this.users.countDocuments();
  }

  async nbFiles() {
    await this.connection;
    return this.files.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
