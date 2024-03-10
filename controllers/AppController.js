import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200).json(status);
  }

  static getStats(request, response) {
    const nbUsrANDFile = {
      users: dbClient.nbUsers(),
      files: dbClient.nbFiles(),
    };
    response.status(200).json(nbUsrANDFile);
  }
}
module.exports = AppController;
