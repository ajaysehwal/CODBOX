import winston from "winston";

export class Logger {
  private logger: winston.Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === "production";
    const customColors = {
      error: "red",
      warn: "yellow",
      info: "green",
      debug: "blue",
      verbose: "cyan",
      silly: "magenta",
    };

    winston.addColors(customColors);

    this.logger = winston.createLogger({
      level: isProd ? "error" : "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        ...(!isProd
          ? [
              new winston.transports.Console({
                format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                  })
                ),
              }),
            ]
          : []),
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });
  }

  info(message: string, ...meta: any[]) {
    if (process.env.NODE_ENV !== "production") {
      this.logger.info(message, ...meta);
    }
  }

  warn(message: string, ...meta: any[]) {
    if (process.env.NODE_ENV !== "production") {
      this.logger.warn(message, ...meta);
    }
  }

  error(message: string, ...meta: any[]) {
    this.logger.error(message, ...meta);
  }
}
