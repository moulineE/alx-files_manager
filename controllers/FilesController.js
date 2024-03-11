import { v4 as uuidv4 } from 'uuid';
import Helper from '../utils/helper';

const fs = require('fs');

const acceptedFileTypes = ['folder', 'file', 'image'];
class FilesController {
  static async postUpload(request, response) {
    const relPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const userId = await Helper.getUserIdByToken(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Helper.getUserByUserId(userId);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const fileName = request.body.name;
    if (!fileName) {
      return response.status(400).json({ error: 'Missing name' });
    }
    const fileType = request.body.type;
    if (!fileType || !acceptedFileTypes.includes(fileType)) {
      return response.status(400).json({ error: 'Missing type' });
    }
    let fileParentId = request.body.parentId || 0;
    const fileIsPublic = request.body.isPublic || false;
    const fileData = request.body.data;
    if (fileType === !'folder' && !fileData) {
      return response.status(400).json({ error: 'Missing data' });
    }
    fileParentId = fileParentId === '0' ? 0 : fileParentId;
    if (fileParentId !== 0) {
      const parentFile = await Helper.getFileByParentId(fileParentId);
      if (!parentFile) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const newFile = {
      userId: user._id,
      name: fileName,
      type: fileType,
      isPublic: fileIsPublic,
      parentId: fileParentId,
    };
    if (fileType === 'folder') {
      const tmpFile = await Helper.insertFile(newFile);
      return response.status(201).json({
        id: tmpFile.ops[0]._id,
        userId: tmpFile.ops[0].userId,
        name: tmpFile.ops[0].name,
        type: tmpFile.ops[0].type,
        isPublic: tmpFile.ops[0].isPublic,
        parentId: tmpFile.ops[0].parentId,
      });
    }
    const localFilename = uuidv4();
    const localPath = `${relPath}/${localFilename}`;
    const clearData = Buffer.from(fileData, 'base64');
    fs.mkdirSync(relPath, { recursive: true });
    await fs.promises.writeFile(localPath, clearData, (err) => {
      if (err) throw err;
    });
    newFile.localPath = localPath;
    const tmpFile = await Helper.insertFile(newFile);
    return response.status(201).json({
      id: tmpFile.ops[0]._id,
      userId: tmpFile.ops[0].userId,
      name: tmpFile.ops[0].name,
      type: tmpFile.ops[0].type,
      isPublic: tmpFile.ops[0].isPublic,
      parentId: tmpFile.ops[0].parentId,
    });
  }
}
module.exports = FilesController;
