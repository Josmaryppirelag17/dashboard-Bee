"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL = 30 * 1000;
const STORAGE_KEY = "beehive_session";

interface SessionData {
  deviceId: string;
  isOnline: boolean;
  sessionStart: number;
  lastActive: number;
  totalActiveMs: number;
}

function generateSecureDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `device_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now();
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `device_${timestamp}_${randomHex}`;
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("beehive_deviceId");
  if (!id) {
    id = generateSecureDeviceId();
    localStorage.setItem("beehive_deviceId", id);
  }
  return id;
}

export function useSessionTracker() {
  const deviceId = useRef(getOrCreateDeviceId());
  const [isOnline, setIsOnline] = useState(true);
  const [activeDuration, setActiveDuration] = useState(0);
  const lastActiveRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  const updateActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
    setIsOnline(true);
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    const heartbeat = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActiveRef.current;

      if (elapsed > INACTIVITY_TIMEOUT) {
        setIsOnline(false);
      } else {
        const sessionData: SessionData = {
          deviceId: deviceId.current,
          isOnline: true,
          sessionStart: sessionStartRef.current,
          lastActive: lastActiveRef.current,
          totalActiveMs: now - sessionStartRef.current,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        setActiveDuration(sessionData.totalActiveMs);
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(heartbeat);
    };
  }, [updateActivity]);

  const formatDuration = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return {
    deviceId: deviceId.current,
    isOnline,
    activeDuration,
    formattedDuration: formatDuration(activeDuration),
  };
}
