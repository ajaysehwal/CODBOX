import express from "express";
import { FileOrganizer } from "../controllers/workfilesOrganizer";
import config from "../config";
const router = express.Router();
const fileOrganizer = new FileOrganizer({
  bucketName: config.aws_s3_bucket,
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key,
  region: config.aws_region,
});
router.post("/create/index", async (req, res) => {
  const result = await fileOrganizer.createFile(req.body);
  res.status(result.success ? 201 : 400).json(result);
});
router.get("/:userId/:filename", async (req, res) => {
  try {
    const content = await fileOrganizer.getFileContent(
      req.params.userId,
      req.params.filename
    );
    res.json({ content });
  } catch (error) {
    res.status(404).json({ success: false, message: "File not found" });
  }
});
router.get('/:userId', async (req, res) => {
    const files = await fileOrganizer.listUserFiles(req.params.userId);
    res.json({ files });
  });

export default router;
