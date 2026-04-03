self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "Anime Fan";
  const body = data.body || "";
  const icon = data.icon || "/anime-fan-250x250.avif";
  const image = data.image;
  const url = data.url || "/";
  const notificationId = data.notificationId;
  const tag = data.tag;

  const options = {
    body,
    icon,
    image,
    tag,
    data: { url, notificationId },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const url = event.notification?.data?.url || "/";
  const notificationId = event.notification?.data?.notificationId;
  event.notification.close();

  event.waitUntil(
    (async () => {
      try {
        const target = url.startsWith("http")
          ? url
          : `${self.location.origin}${url}`;
        await clients.openWindow(target);
      } catch {}
      if (notificationId) {
        try {
          await fetch(`${self.location.origin}/api/push/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId, action: "opened" }),
            keepalive: true,
          });
        } catch {}
      }
    })(),
  );
});

self.addEventListener("notificationclose", (event) => {
  const notificationId = event.notification?.data?.notificationId;
  if (!notificationId) return;
  event.waitUntil(
    fetch(`${self.location.origin}/api/push/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId, action: "dismissed" }),
      keepalive: true,
    }).catch(() => {}),
  );
});
