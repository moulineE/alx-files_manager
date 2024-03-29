import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

class Helper {
  static async getUserIdByToken(request) {
    const token = request.headers['x-token'];
    return redisClient.get(`auth_${token}`);
  }

  static async getUserByUserId(userId) {
    return dbClient.users.findOne({ _id: ObjectId(userId) });
  }

  static async getFileByParentId(parentId) {
    return dbClient.files.findOne({ _id: ObjectId(parentId) });
  }

  static async insertFile(file) {
    return dbClient.files.insertOne(file);
  }

  static async getFileByFileIdAndUserId(fileId, userId) {
    return dbClient.files.findOne({ _id: ObjectId(fileId), userId });
  }

  static async updateFileByFileId(fileId, field, value) {
    return dbClient.files.findOne({ _id: ObjectId(fileId) }, { $set: { field: value } });
  }
}
module.exports = Helper;
