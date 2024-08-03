import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "./utils/auth.server";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);

	if (user) {
		user.passwordHash = undefined;
	}

	return {
		user,
	};
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="shortcut icon" href="/logo.png" type="image/png" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Chivo:ital,wght@0,100..900;1,100..900&family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap"
					rel="stylesheet"
				/>
				<Meta />
				<Links />
			</head>
			<body className="grid justify-center bg-twine-100 *:font-chivo">
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
