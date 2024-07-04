import Redis from "ioredis";
export const pub = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
});

export const sub = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
});
export const redis = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
});
