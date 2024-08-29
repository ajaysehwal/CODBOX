import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "development";

const requiredEnvVars = [
  "PORT",
  "JUDGE0API_KEY",
  "JUDGE0API_HOST",
  "AWS_ACCESS_KEY",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

validateEnv();

const baseConfig = {
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: env,
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    region: process.env.AWS_REGION as string,
    bucketName: process.env.AWS_S3_BUCKET as string,
  },
};

export default { ...baseConfig };
