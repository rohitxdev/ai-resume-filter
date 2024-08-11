import * as Paddle from "@paddle/paddle-js";

export const initPaddle = (token: string, callback: (e: Paddle.PaddleEventData) => void) =>
	Paddle.initializePaddle({ token, eventCallback: callback });
