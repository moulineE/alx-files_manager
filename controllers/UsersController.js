import dbClient from '../utils/db';

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
}
module.exports = UsersController;
