import { S3Client } from "@aws-sdk/client-s3";
import { S3Config } from "../interface";


export const createS3Client = (config: S3Config): S3Client => {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};
