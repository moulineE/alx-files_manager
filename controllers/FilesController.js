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

  static async getShow(request, response) {
    const userId = await Helper.getUserIdByToken(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Helper.getUserByUserId(userId);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = request.params.id || '';
    const file = await Helper.getFileByFileIdAndUserId(fileId, userId);
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }
    return response.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(request, response) {
    const userId = await Helper.getUserIdByToken(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Helper.getUserByUserId(userId);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    return response.status(404).json({ error: 'not implemented yet' });
  }

  static async putPublish(request, response) {
    const userId = await Helper.getUserIdByToken(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Helper.getUserByUserId(userId);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = request.params.id || '';
    const file = await Helper.getFileByFileIdAndUserId(fileId, userId);
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }
    await Helper.updateFileByFileId(fileId, 'isPublic', true);
    const updatedFile = await Helper.getFileByFileIdAndUserId(fileId, userId);
    return response.status(200).json({
      id: updatedFile._id,
      userId: updatedFile.userId,
      name: updatedFile.name,
      type: updatedFile.type,
      isPublic: updatedFile.isPublic,
      parentId: updatedFile.parentId,
    });
  }

  static async putUnpublish(request, response) {
    const userId = await Helper.getUserIdByToken(request);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Helper.getUserByUserId(userId);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = request.params.id || '';
    const file = await Helper.getFileByFileIdAndUserId(fileId, userId);
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }
    await Helper.updateFileByFileId(fileId, 'isPublic', false);
    const updatedFile = await Helper.getFileByFileIdAndUserId(fileId, userId);
    return response.status(200).json({
      id: updatedFile._id,
      userId: updatedFile.userId,
      name: updatedFile.name,
      type: updatedFile.type,
      isPublic: updatedFile.isPublic,
      parentId: updatedFile.parentId,
    });
  }
}
module.exports = FilesController;
