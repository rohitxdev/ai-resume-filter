import { TransactionCompletedEvent } from "@paddle/paddle-node-sdk";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { addCredits } from "~/db/user.server";
import { getCustomer } from "../store/payments.server";

export const action = async (args: ActionFunctionArgs) => {
	switch (args.request.method) {
		case "POST": {
			const body = await args.request.json();
			const { data } = new TransactionCompletedEvent(body);
			const amount = data.payments[0].amount;
			if (!data.customerId || !amount) break;

			const customer = await getCustomer(data.customerId);
			addCredits(customer.email, Number.parseInt(amount, 10));
			break;
		}

		default:
			break;
	}
	return json(null, 200);
};
