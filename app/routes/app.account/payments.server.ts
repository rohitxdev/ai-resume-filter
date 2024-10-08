import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { config } from "app/utils/config.server";

const paddle = new Paddle(config.PADDLE_API_KEY, { environment: config.APP_ENV === "production" ? Environment.production : Environment.sandbox });

export const getTransaction = async (id: string) => await paddle.transactions.get(id);

export const getCustomer = async (id: string) => await paddle.customers.get(id);
