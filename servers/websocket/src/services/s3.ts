import config from "../config";
import { S3Store } from "../store/s3Store";

export abstract class S3 extends S3Store {
  constructor() {
    super({
      accessKeyId: config.aws_access_key_id,
      secretAccessKey: config.aws_secret_access_key,
      bucketName: config.aws_s3_bucket,
      region: config.aws_region,
    });
  }
}
