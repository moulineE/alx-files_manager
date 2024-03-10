import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const sha1 = require('sha1');

class UsersController {
  static async postNew(request, response) {
    if (!request.body) {
      return response.status(400).json({ error: 'Missing request body' });
    }
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    const user = await dbClient.users.findOne({ email });
    if (user) {
      return response.status(400).json({ error: 'Already exist' });
    }
    const hashedPass = sha1(password);

    const newUser = await dbClient.users.insertOne({ email, password: hashedPass });
    return response.status(201).json({ id: newUser.ops[0]._id, email: newUser.ops[0].email });
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
    return response.status(200).json({ id: user._id, email: user.email });
  }
}
module.exports = UsersController;
