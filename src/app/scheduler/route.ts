import scheduler_routine from "./scheduler";

export async function GET() {
	// Guard the route to ensure that it can only run once
	let isRunning = false;
	if (isRunning) {
		return new Response("Scheduler is already running");
	} else {
		isRunning = true;
		// Start the scheduler routine
		scheduler_routine();
		return new Response("Scheduler started");
	}
}
