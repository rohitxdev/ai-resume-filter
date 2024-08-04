import { Link } from "@remix-run/react";
import type { ComponentProps } from "react";
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";
import { LuCoins } from "react-icons/lu";
import { useRootLoader } from "~/utils/hooks";

interface CreditsLeftProps extends ComponentProps<typeof Button> {}

export const CreditsLeft = ({ className, ...props }: CreditsLeftProps) => {
	const { user } = useRootLoader();
	if (!user) return null;

	return (
		<TooltipTrigger delay={200}>
			<Button
				className={`border-2 cursor-default flex gap-3 items-center py-2 px-3 rounded-full border-black ${className}`}
				{...props}
			>
				<LuCoins className="size-5" />
				<span className="font-semibold mr-1">{user.creditsLeft}</span>
			</Button>
			<Tooltip className="bg-white border rounded-md mt-3 py-2 px-4">
				<OverlayArrow>
					<div className="border-8 border-transparent border-b-white" />
				</OverlayArrow>
				<p>You have {user.creditsLeft} credits left.</p>
				<Link
					className="text-center text-twine-800 underline underline-offset-2 block mx-auto"
					to="/store"
				>
					Buy more
				</Link>
			</Tooltip>
		</TooltipTrigger>
	);
};
