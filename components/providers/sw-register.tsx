"use client";
import { useEffect } from "react";

const NOTIFICATION_HOURS = [12, 18];

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
    const registration = await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
    console.log("SW registered:", registration.scope);

    // Nếu đã có quyền thông báo → khởi động lịch ngay, không hỏi lại
    if ("Notification" in window && Notification.permission === "granted") {
      setupNotificationSchedule(registration);
    }
    // Nếu chưa có quyền → NotificationManager (banner) sẽ xử lý việc xin quyền
  } catch (error) {
    console.warn("SW registration failed:", error);
  }
}

export function setupNotificationSchedule(registration: ServiceWorkerRegistration) {
  const checkAndNotify = () => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Thông báo trong khoảng phút 0-4 của giờ đã định
    if (NOTIFICATION_HOURS.includes(hour) && minute < 5) {
      const today = now.toDateString();
      const key = `fem-notified-${today}-${hour}`;

      // Không thông báo 2 lần trong cùng một giờ trong ngày
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");

        const messages = [
          "Đã đến giờ ghi chi tiêu! 📝",
          "Bạn đã chi tiêu gì hôm nay chưa? 💰",
          "Nhắc nhở: điền chi tiêu để quản lý tốt hơn! 🏠",
        ];
        const body = messages[Math.floor(Math.random() * messages.length)];

        if (registration.active) {
          registration.active.postMessage({
            type: "SHOW_NOTIFICATION",
            body,
          });
        }
      }
    }
  };

  // Kiểm tra ngay lập tức
  checkAndNotify();

  // Kiểm tra mỗi phút
  setInterval(checkAndNotify, 60 * 1000);
}
