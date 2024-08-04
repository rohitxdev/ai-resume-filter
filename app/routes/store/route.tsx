import type { Paddle } from "@paddle/paddle-js";
import { useEffect, useRef, useState } from "react";
import { Button, Heading, Label, Slider, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import { useRootLoader } from "~/utils/hooks";
import { initPaddle } from "./payments.client";

const Route = () => {
	const { clientConfig, user } = useRootLoader();
	const minCredits = clientConfig.MINIMUM_PURCHASE_AMOUNT;
	const [credits, setCredits] = useState(minCredits);
	const paddle = useRef<Paddle | null>(null);

	useEffect(() => {
		initPaddle(clientConfig.PADDLE_CLIENT_TOKEN).then((res) => {
			if (!res) return;
			res.Environment.set(clientConfig.APP_ENV === "production" ? "production" : "sandbox");
			paddle.current = res;
		});
	});

	return (
		<div className="">
			<Heading className="font-semibold text-4xl">Store</Heading>
			<div>
				<Heading className="text-xl">Buy credits</Heading>
				<p>Credits are used to filter resumes. Each page costs 1 credit. You can buy {minCredits} credits for 5 USD.</p>
			</div>
			<Slider
				className="mx-auto my-4 w-64"
				defaultValue={minCredits}
				minValue={minCredits}
				maxValue={20 * minCredits}
				step={minCredits}
				onChange={setCredits}
			>
				<div className="flex w-full justify-between">
					<Label>Credits</Label>
					<SliderOutput />
				</div>
				<SliderTrack className="relative h-7 w-full">
					{({ state }) => (
						<>
							<div className="absolute top-[50%] h-2 w-full translate-y-[-50%] rounded-full bg-gray-200" />
							<div
								className={`absolute top-[50%] h-2 translate-y-[-50%] rounded-full duration-75 ${state.isThumbDragging(0) ? "bg-gray-700" : "bg-gray-400"}`}
								style={{ width: `${state.getThumbPercent(0) * 100}%` }}
							/>
							<SliderThumb className="top-[50%] h-5 w-3 rounded-sm border border-solid bg-gray-400 dragging:bg-gray-600 outline-none ring-black transition duration-75 focus-visible:ring-2" />
						</>
					)}
				</SliderTrack>
			</Slider>
			<Button
				className="mx-auto my-4 block rounded bg-twine-500 px-4 py-3 font-semibold"
				onPress={() =>
					paddle.current?.Checkout.open({
						items: [{ priceId: "pri_01j4f2j9zj7a15m55se3hww8cv", quantity: credits / minCredits }],
						customer: user ? { email: user.email } : undefined,
					})
				}
			>
				Buy for {(credits * 5) / minCredits} USD
			</Button>
		</div>
	);
};

export default Route;
