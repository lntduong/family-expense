"use client";
import { useEffect } from "react";

const NOTIFICATION_HOURS = [12, 18]; // 12:00 and 18:00
const STORAGE_KEY = "fem-last-notification";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register("/service-worker.js");
    console.log("SW registered");

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted");
      }
    }

    // Try to register periodic background sync (Chrome only)
    if ("periodicSync" in registration) {
      try {
        await (registration as any).periodicSync.register("expense-reminder", {
          minInterval: 60 * 60 * 1000, // 1 hour
        });
        console.log("Periodic sync registered");
      } catch (e) {
        console.log("Periodic sync not supported, using fallback");
        setupFallbackNotifications(registration);
      }
    } else {
      setupFallbackNotifications(registration);
    }
  } catch (error) {
    console.error("SW registration failed:", error);
  }
}

function setupFallbackNotifications(registration: ServiceWorkerRegistration) {
  // Check every minute if it's time to notify
  const checkAndNotify = () => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Only notify at the start of the hour (within first 5 minutes)
    if (NOTIFICATION_HOURS.includes(hour) && minute < 5) {
      const lastNotification = localStorage.getItem(STORAGE_KEY);
      const today = now.toDateString();
      const key = `${today}-${hour}`;

      // Don't notify twice for the same hour
      if (lastNotification !== key) {
        localStorage.setItem(STORAGE_KEY, key);
        
        // Send message to service worker to show notification
        if (registration.active) {
          registration.active.postMessage({
            type: "SHOW_NOTIFICATION",
            body: "Hãy vào app để điền thu chi bạn nhé! 💰",
          });
        }
      }
    }
  };

  // Check immediately
  checkAndNotify();

  // Check every minute
  setInterval(checkAndNotify, 60 * 1000);
}
