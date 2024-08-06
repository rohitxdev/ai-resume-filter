import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { config } from "~/utils/config.server";

const paddle = new Paddle(config.PADDLE_API_KEY, { environment: config.APP_ENV === "production" ? Environment.production : Environment.sandbox });

export const getTransaction = async (id: string) => {
	const res = await paddle.transactions.get(id);
	return res;
};

export const getCustomer = async (id: string) => {
	const res = await paddle.customers.get(id);
	return res;
};
