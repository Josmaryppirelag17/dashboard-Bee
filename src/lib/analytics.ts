/** Cliente de analytics generico con soporte para page views y eventos. */

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = [];
  constructor() {
    if (typeof window !== "undefined") this.startFlush();
  }

  track(name: string, properties?: Record<string, unknown>) {
    this.queue.push({ name, properties, timestamp: Date.now() });
  }

  pageView(path: string) {
    this.track("page_view", {
      path,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  }

  private startFlush() {
    setInterval(() => this.flush(), 5000);
    window.addEventListener("beforeunload", () => this.flush());
  }

  private async flush() {
    if (this.queue.length === 0 || !ANALYTICS_ENDPOINT) return;
    const batch = [...this.queue];
    this.queue = [];
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify({ events: batch }));
      return;
    }
    try {
      await fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
    } catch {}
  }
}

export const analytics =
  typeof window !== "undefined" ? new AnalyticsClient() : ({} as AnalyticsClient);
