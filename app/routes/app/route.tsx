import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { Tab, TabList, Tabs } from "react-aria-components";
import { LuHistory, LuHome, LuUser } from "react-icons/lu";

export default function App() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<Tabs
			className="grid h-screen w-screen max-w-5xl grid-rows-[auto_1fr] gap-4 overflow-hidden p-4 *:rounded-lg *:border *:bg-white/50 last:*:p-6"
			orientation="horizontal"
			defaultSelectedKey={location.pathname}
			onSelectionChange={(key) => navigate(key.toString())}
		>
			<TabList className="flex justify-center gap-2 p-4 *:flex *:max-w-36 *:flex-1 *:items-center *:justify-center *:gap-2 *:rounded *:border *:border-transparent selected:*:border-black selected:*:bg-twine-100 *:px-3 *:py-2 *:outline-none hover:*:border hover:*:bg-twine-100 focus:*:bg-twine-100">
				<Tab id="/app">
					<LuHome /> Home
				</Tab>
				<Tab id="/app/sessions">
					<LuHistory /> Sessions
				</Tab>
				<Tab id="/app/account">
					<LuUser /> Account
				</Tab>
			</TabList>
			<Outlet />
		</Tabs>
	);
}
