import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSessions } from "~/db/sessions.server";
import { getUser } from "~/utils/auth.server";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return null;

	return { sessions: getSessions(Number.parseInt(user.id, 10)) };
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<h1 className="font-semibold text-4xl">Sessions</h1>
			<div className="flex flex-col gap-4">
				{data?.sessions.map((item) => (
					<div className="border border-black p-3" key={item.createdAt}>
						<p>Created at: {item.createdAt}</p>
						<p>Job Description: {item.jobDescription}</p>
						<p>Consumed Credits: {item.consumedCredits}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Route;
