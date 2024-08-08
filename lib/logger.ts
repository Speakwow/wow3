import winston from 'winston';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// 配置 winston 日志记录器
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => {
        return formatInTimeZone(new Date(), 'Asia/Shanghai', 'yyyy-MM-dd HH:mm:ssXXX');
      }
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // 输出到控制台
  ]
});