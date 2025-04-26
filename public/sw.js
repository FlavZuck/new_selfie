self.addEventListener("push", (event) => {
	const data = event.data ? event.data.json() : {};
	const { title, body, data: payloadData } = data;
	const options = { body, data: payloadData };
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url || "/";
	event.waitUntil(clients.openWindow(url));
});
