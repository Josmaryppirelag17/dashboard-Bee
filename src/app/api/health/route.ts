import { NextResponse } from "next/server";

const startedAt = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startedAt) / 1000);
  return NextResponse.json(
    {
      status: "healthy",
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.0",
    },
    { status: 200 },
  );
}
