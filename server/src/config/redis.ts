import Redis from "ioredis";
export const pub = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});
export const sub = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});
export const redis = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST as string,
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});