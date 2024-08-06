import { Outlet, useNavigate } from "@remix-run/react";
import { Tab, TabList, Tabs } from "react-aria-components";
import { LuCoins, LuHistory, LuHome } from "react-icons/lu";

export default function App() {
	const navigate = useNavigate();

	return (
		<Tabs
			className="grid h-screen w-screen max-w-5xl grid-rows-[auto_1fr] gap-4 p-4 *:rounded-lg *:border *:bg-white/50 last:*:p-8"
			orientation="horizontal"
			onSelectionChange={(key) => navigate(key.toString())}
		>
			<TabList className="flex justify-center p-4 *:flex *:w-36 *:items-center *:justify-center *:gap-2 *:rounded *:border *:border-transparent selected:*:bg-twine-200 *:px-3 *:py-2 *:outline-none hover:*:border hover:*:bg-twine-100 focus:*:bg-twine-100">
				<Tab id="/app">
					<LuHome /> Home
				</Tab>
				<Tab id="/app/sessions">
					<LuHistory /> Sessions
				</Tab>
				<Tab id="/app/store">
					<LuCoins /> Store
				</Tab>
			</TabList>
			<Outlet />
		</Tabs>
	);
}
