import { Link } from "@remix-run/react";
import { Button, Dialog, Heading } from "react-aria-components";
import { LuAlertTriangle, LuArrowRight, LuX } from "react-icons/lu";

export const OutOfCreditsDialog = () => {
	return (
		<Dialog className="border-none outline-none">
			{({ close }) => (
				<div className="relative rounded-md bg-twine-100 p-4">
					<Button className="absolute top-0 right-0 m-4 text-gray-600 hover:text-black" onPress={close}>
						<LuX className="size-4 stroke-[3]" />
					</Button>
					<Heading className="flex items-center gap-2 font-semibold text-2xl">
						<LuAlertTriangle />
						<span>Out of Credits</span>
					</Heading>
					<p className="mt-2">You have no credits left. Please purchase more credits to continue.</p>
					<Link
						className="group mx-auto mt-4 mb-2 flex w-fit items-center gap-2 rounded bg-twine-600 px-4 py-2 text-white active:bg-twine-700 "
						to="/app/account"
					>
						Purchase Credits
						<LuArrowRight className="size-5 duration-100 group-hover:translate-x-1" />
					</Link>
				</div>
			)}
		</Dialog>
	);
};
