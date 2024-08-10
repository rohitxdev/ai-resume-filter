import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import "./tailwind.css";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Toaster } from "react-hot-toast";
import { getUser } from "./utils/auth.server";
import { config } from "./utils/config.server";

const clientConfig = {
	APP_ENV: config.APP_ENV,
	MINIMUM_PURCHASE_AMOUNT: config.MINIMUM_PURCHASE_AMOUNT,
	MAX_JOB_DESCRIPTION_LENGTH: config.MAX_JOB_DESCRIPTION_LENGTH,
	PADDLE_CLIENT_TOKEN: config.PADDLE_CLIENT_TOKEN,
} as const;

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);

	if (user) {
		user.passwordHash = undefined;
	}

	return {
		user,
		clientConfig,
	};
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>FilterCV</title>
				<meta name="description" content="Streamline your hiring with AI resume filtering." />
				{/*Facebook meta tags*/}
				<meta property="og:url" content="https://filtercv.com" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="FilterCV" />
				<meta property="og:description" content="Streamline your hiring with AI resume filtering." />
				<meta property="og:image" content="https://filtercv.com/og.png" />
				{/*Twitter meta tags*/}
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:domain" content="filtercv.com" />
				<meta property="twitter:url" content="https://filtercv.com" />
				<meta name="twitter:title" content="FilterCV" />
				<meta name="twitter:description" content="Streamline your hiring with AI resume filtering." />
				<meta name="twitter:image" content="https://filtercv.com/og.png" />
				{/*Fonts*/}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Chivo:ital,wght@0,100..900;1,100..900&family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap"
					rel="stylesheet"
				/>
				{/*Favicons*/}
				<link rel="shortcut icon" href="/logo.png" type="image/png" />
				<Meta />
				<Links />
			</head>
			<body className="grid justify-center bg-twine-100 *:font-chivo">
				<Toaster />
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
