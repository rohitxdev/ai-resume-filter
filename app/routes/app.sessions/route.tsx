import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getSessions } from "app/db/sessions.server";
import { getUser } from "app/utils/auth.server";
import { LuCoins } from "react-icons/lu";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return null;

	return json({ sessions: await getSessions(user.id) }, { headers: { "Cache-Control": "max-age=60" } });
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col gap-2 overflow-y-auto">
			<h1 className="font-semibold text-4xl">History</h1>
			<p className="text-gray-600">History is stored for 7 days.</p>
			<div className="flex flex-col-reverse gap-4 overflow-y-auto">
				{data?.sessions.map((item) => (
					<div className="flex gap-4 rounded border border-black p-3" key={item.createdAt}>
						<p className="line-clamp-3">{item.jobDescription}</p>
						<div className="flex items-center gap-2">
							<LuCoins />
							<span>{item.consumedCredits}</span>
						</div>
						<span>{new Date(item.createdAt).toDateString()}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Route;
