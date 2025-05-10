self.addEventListener("push", (event) => {
	// Per il debug
	console.log("[SW] Push event data:", event.data?.text());

	const data = event.data ? event.data.json() : {};
	const title = data.title ?? "Notifica generica";
	const body = data.body ?? "Non è stato fornito alcun corpo";

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			data: data.data ?? {}
		})
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url || "/";
	event.waitUntil(clients.openWindow(url));
});
