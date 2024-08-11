import { CheckoutEventNames, type Paddle } from "@paddle/paddle-js";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useRevalidator } from "@remix-run/react";
import { getUser } from "app/utils/auth.server";
import { useCommonLoader } from "app/utils/hooks";
import { useEffect, useRef, useState } from "react";
import { Button, Heading, Label, Slider, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import { LuCoins, LuCreditCard, LuLogOut } from "react-icons/lu";
import { initPaddle } from "./payments.client";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return redirect("/auth/log-in");
	return json(null, { headers: { "Cache-Control": "max-age=60" } });
};

const Route = () => {
	const { clientConfig, user } = useCommonLoader();
	const minCredits = clientConfig.MINIMUM_PURCHASE_AMOUNT;
	const [credits, setCredits] = useState(minCredits);
	const paddle = useRef<Paddle | null>(null);
	const totalPrice = (credits * 5) / minCredits;
	const { revalidate } = useRevalidator();

	useEffect(() => {
		const getPaddle = async () => {
			const res = await initPaddle(clientConfig.PADDLE_CLIENT_TOKEN, (e) => {
				if (e.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
					paddle?.current?.Checkout.close();
					revalidate();
				}
			});
			if (!res) return;

			res.Environment.set(clientConfig.APP_ENV === "production" ? "production" : "sandbox");
			paddle.current = res;
		};

		getPaddle();
	});

	if (!user) return null;

	return (
		<div className="">
			<Heading className="font-semibold text-3xl">Buy credits</Heading>
			<p className="leading-loose">Credits are used to filter resumes. Each page costs 1 credit. You can buy {minCredits} credits for 5 USD.</p>
			<Slider
				className="mx-auto my-4 w-full"
				defaultValue={minCredits}
				minValue={minCredits}
				maxValue={20 * minCredits}
				step={minCredits}
				onChange={setCredits}
			>
				<div className="flex w-full justify-between">
					<Label className="font-semibold text-xl">Credits</Label>
					<div className="flex items-center gap-2 text-lg">
						<LuCoins className="size-4" />
						<SliderOutput />
					</div>
				</div>
				<SliderTrack className="relative h-7 w-full">
					{({ state }) => (
						<>
							<div className="absolute top-[50%] h-2 w-full translate-y-[-50%] rounded-full border border-black/10 bg-black/20" />
							<div
								className="absolute top-[50%] h-2 translate-y-[-50%] rounded-full bg-black duration-75"
								style={{ width: `${state.getThumbPercent(0) * 100}%` }}
							/>
							<SliderThumb className="top-[50%] size-5 rounded-full border border-solid bg-gray-600 dragging:bg-gray-800 outline-none ring-black transition duration-75 focus-visible:ring-2" />
						</>
					)}
				</SliderTrack>
			</Slider>
			<p className="text-center font-semibold text-xl">{totalPrice} USD</p>
			<Button
				className="mx-auto my-4 block rounded bg-twine-500 px-4 py-3 font-semibold text-xl outline-none active:bg-twine-600"
				onPress={() =>
					paddle.current?.Checkout.open({
						items: [{ priceId: "pri_01j4f2j9zj7a15m55se3hww8cv", quantity: credits / minCredits }],
						customer: { email: user.email },
					})
				}
			>
				Buy Now
			</Button>
			{clientConfig.APP_ENV !== "production" && (
				<div className="*: m-8 mx-auto w-fit space-y-4 rounded-md border border-black p-6 *:flex *:items-center *:gap-4">
					<h3 className="font-semibold text-xl">Dummy Credit Card</h3>
					<div>
						<LuCreditCard />
						<p>4000 0566 5566 5556 </p>
					</div>
					<div>
						<p className="font-bold text-sm">CVV</p>
						<p>100</p>
					</div>
				</div>
			)}
			<Heading className="font-semibold text-3xl leading-loose">Account</Heading>
			<Form method="POST" action="/auth/log-out">
				<Button className="flex items-center gap-2 border border-black px-3 py-2" type="submit">
					<LuLogOut /> Log Out
				</Button>
			</Form>
		</div>
	);
};

export default Route;
