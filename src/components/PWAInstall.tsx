"use client";

import { useEffect, useState } from "react";
import { Download, Bell, BellOff, X, Sparkles, Check } from "lucide-react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA Service Worker] Registered successfully with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("[PWA Service Worker] Registration failed:", err);
        });
    }

    // 2. Handle PWA installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Auto-show PWA banner after 4 seconds on first load if not dismissed
      const isDismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!isDismissed) {
        setTimeout(() => setShowBanner(true), 4000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Track current notification state
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Install] User outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        // Trigger a nice success notification
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("Blood Indo Activated!", {
          body: "You will now receive emergency blood dispatches instantly.",
          icon: "/logo.png",
          badge: "/logo.png",
          vibrate: [100, 50, 100],
          data: {
            url: "/feed"
          }
        } as any);

        triggerToast("Emergency notifications activated successfully!");
      } else {
        triggerToast("Alert permissions were denied.");
      }
    } catch (err) {
      console.error("[PWA Notification] Permission request failed:", err);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <>
      {/* 1. Floating PWA Install Banner */}
      {showBanner && isInstallable && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999] animate-bounce-short">
          <div className="glass-panel bg-brand-charcoal/90 border border-brand-red-neon/30 rounded-2xl p-5 shadow-[0_10px_40px_rgba(255,0,60,0.15)] flex gap-4 relative overflow-hidden backdrop-blur-md">
            {/* Pulsing light behind */}
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-brand-red-neon/10 blur-xl pointer-events-none"></div>

            <div className="h-12 w-12 shrink-0 rounded-xl bg-brand-red-dark/20 border border-brand-red-neon/30 flex items-center justify-center text-brand-red-neon shadow-inner">
              <Download className="h-6 w-6 animate-pulse" />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-brand-red-glow uppercase tracking-widest">Install App</span>
                <Sparkles className="h-3 w-3 text-brand-red-neon animate-spin-slow" />
              </div>
              <h5 className="text-sm font-bold text-white leading-none">Add to Mobile/Desktop</h5>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Install bloodundo.in for offline support, fast matching alerts, and direct home access.
              </p>
              
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-brand-red-neon transition-colors cursor-pointer"
                >
                  Install Now
                </button>
                <button
                  onClick={dismissBanner}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={dismissBanner}
              className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[9999] animate-fade-in-up">
          <div className="glass-panel bg-brand-black/90 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-3 backdrop-blur-md">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-100">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 3. In-App Notification Permission Bar */}
      {notificationPermission !== "granted" && (
        <div className="w-full bg-brand-red-dark/10 border-b border-brand-red-neon/20 px-4 py-2.5 flex items-center justify-center gap-3 text-center relative z-20">
          <span className="flex h-2 w-2 shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red-neon"></span>
          </span>
          <p className="text-xs font-bold text-gray-300">
            Never miss an emergency around you. Activate push notification alerts now.
          </p>
          <button
            onClick={requestNotificationPermission}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red hover:bg-brand-red-neon text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Bell className="h-3 w-3 animate-pulse" />
            Enable Alerts
          </button>
        </div>
      )}
    </>
  );
}
