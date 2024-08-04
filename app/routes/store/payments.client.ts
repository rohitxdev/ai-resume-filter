import * as Paddle from "@paddle/paddle-js";

export const initPaddle = (token: string) => Paddle.initializePaddle({ token });
