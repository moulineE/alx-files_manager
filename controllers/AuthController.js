import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader) {
      const auth = Buffer.from(authorizationHeader.split(' ')[1], 'base64').toString().split(':');
      const email = auth[0];
      const password = auth[1];
      if (!email || !password) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      const hashedPass = sha1(password);
      const user = await dbClient.users.findOne({ email, hashedPass });
      if (!user) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 86400);
      return response.status(200).json({ token });
    }
    return response.status(401).json({ error: 'Unauthorized' });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return response.status(204).end();
  }
}
module.exports = AuthController;
