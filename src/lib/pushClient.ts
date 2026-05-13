const BASE64_PAD_LENGTH = 4;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((BASE64_PAD_LENGTH - (base64String.length % BASE64_PAD_LENGTH)) % BASE64_PAD_LENGTH);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const ensureServiceWorkerRegistered = async () => {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.register("/sw.js");
  return reg;
};

export const getCurrentSubscription = async () => {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
};

export const subscribeToPush = async (publicVapidKey: string) => {
  const reg = await ensureServiceWorkerRegistered();
  if (!reg) return null;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });
  return sub;
};

export const unsubscribeFromPush = async () => {
  const sub = await getCurrentSubscription();
  if (!sub) return true;
  return sub.unsubscribe();
};
