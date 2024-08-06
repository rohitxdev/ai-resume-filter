import { Link } from "@remix-run/react";
import { Button, Dialog, Heading } from "react-aria-components";
import { LuAlertTriangle, LuArrowRight, LuX } from "react-icons/lu";

export const OutOfCreditsDialog = () => {
	return (
		<Dialog className="outline-none border-none">
			{({ close }) => (
				<div className="bg-twine-100 p-4 rounded-md relative">
					<Button
						className="absolute top-0 right-0 m-4 text-gray-600 hover:text-black"
						onPress={close}
					>
						<LuX className="size-4 stroke-[3]" />
					</Button>
					<Heading className="text-2xl flex items-center gap-2 font-semibold">
						<LuAlertTriangle />
						<span>Out of Credits</span>
					</Heading>
					<p className="mt-2">
						You have no credits left. Please purchase more credits to continue.
					</p>
					<Link
						className="mx-auto group flex bg-twine-600 active:bg-twine-700 py-2 px-4 rounded text-white items-center gap-2 w-fit mt-4 mb-2 "
						to="/store"
					>
						Purchase Credits
						<LuArrowRight className="size-5 group-hover:translate-x-1 duration-100" />
					</Link>
				</div>
			)}
		</Dialog>
	);
};
