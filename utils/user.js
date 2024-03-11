import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

class UserHelper {
  static async getUserIdByToken(request) {
    const token = request.headers['x-token'];
    return redisClient.get(`auth_${token}`);
  }

  static async getUserByUserId(userId) {
    return dbClient.users.findOne({ _id: ObjectId(userId) });
  }
}
module.exports = UserHelper;
