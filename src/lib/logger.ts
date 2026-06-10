/** Logger estructurado con niveles, timestamps y soporte de contexto. */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

class LoggerService {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data);
  }
  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }
  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }
  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (process.env.NODE_ENV === "production" && level === "debug") return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
    };
    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logFn(`[${entry.timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`);
    // Envia a servicio de logging si esta configurado
    if (process.env.LOG_ENDPOINT && (level === "error" || level === "warn")) {
      this.sendToEndpoint(entry).catch(() => {});
    }
  }

  private async sendToEndpoint(entry: LogEntry) {
    await fetch(process.env.LOG_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  }
}

export function createLogger(context: string): LoggerService {
  return new LoggerService(context);
}
