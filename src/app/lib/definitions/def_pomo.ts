export type Pomodoro = {
	userId: string;

	date: Date;
	timerConfig: {
		studyMin: string;
		pauseMin: string;
		savedCycles: number;
	};

	// 	cycles: {
	// 		completed: number;
	// 		missed: number;
	// 		// carriedFromPreviousDay: number;
	// 	};
};
