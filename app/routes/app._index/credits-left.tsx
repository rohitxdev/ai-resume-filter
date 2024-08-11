import { Link } from "@remix-run/react";
import { useCommonLoader } from "app/utils/hooks";
import type { ComponentProps } from "react";
import { Button, OverlayArrow, Tooltip, TooltipTrigger } from "react-aria-components";
import { LuCoins } from "react-icons/lu";

interface CreditsLeftProps extends ComponentProps<typeof Button> {}

export const CreditsLeft = ({ className, ...props }: CreditsLeftProps) => {
	const { user } = useCommonLoader();
	if (!user) return null;

	return (
		<TooltipTrigger delay={200}>
			<Button className={`flex cursor-default items-center gap-3 rounded-full border-2 border-black px-3 py-2 ${className}`} {...props}>
				<LuCoins className="size-5" />
				<span className="mr-1 font-semibold">{user.creditsLeft}</span>
			</Button>
			<Tooltip className="mt-3 rounded-md border bg-white px-4 py-2">
				<OverlayArrow>
					<div className="border-8 border-transparent border-b-white" />
				</OverlayArrow>
				<p>You have {user.creditsLeft} credits left.</p>
				<Link className="mx-auto block text-center text-twine-800 underline underline-offset-2" to="/app/account">
					Buy more
				</Link>
			</Tooltip>
		</TooltipTrigger>
	);
};
