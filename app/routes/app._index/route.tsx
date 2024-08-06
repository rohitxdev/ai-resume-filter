import { type ActionFunctionArgs, type MetaFunction, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Modal } from "app/components/ui";
import { addSession } from "app/db/sessions.server";
import { consumeCredit } from "app/db/user.server";
import { getUser } from "app/utils/auth.server";
import { cache } from "app/utils/cache.server";
import { config } from "app/utils/config.server";
import { xxhashSync } from "app/utils/crypto.server";
import { useCommonLoader } from "app/utils/hooks";
import { useEffect, useState } from "react";
import { Button, DropZone, FileTrigger, Heading, Label, OverlayArrow, TextArea, Tooltip, TooltipTrigger } from "react-aria-components";
import { LuFilePlus2, LuSparkles, LuUploadCloud, LuX } from "react-icons/lu";
import { z } from "zod";
import Spinner from "~/assets/spinner.svg?react";
import { CircularProgressBar } from "./circle-progress";
import { CreditsLeft } from "./credits-left";
import { OutOfCreditsDialog } from "./dialogs";
import { Filters } from "./filters";
import { scanResume } from "./gen-ai.server";
import { convertPDFToImages } from "./pdf.client";

const dataSchema = z.object({
	score: z.number(),
	reason: z.string(),
	email: z.string(),
	name: z.string(),
	isCacheHit: z.boolean(),
});

const responseSchema = z.object({
	success: z.boolean(),
	payload: z.array(dataSchema),
});

const requestSchema = z.object({
	imgUrls: z.array(z.array(z.string())),
	requirements: z.string(),
});

const analyseResume = async (imgUrls: string[], requirements: string, userId: string) => {
	let res: string | null;
	if (config.IS_CACHE_ENABLED) {
		const key = xxhashSync.hash(requirements + imgUrls.join());
		const cachedData = cache.get(key);
		if (cachedData !== null) {
			return { ...JSON.parse(cachedData), isCacheHit: true };
		}

		res = await scanResume(requirements, imgUrls);
		cache.set(key, res);
	} else {
		res = await scanResume(requirements, imgUrls);
	}
	consumeCredit(Number.parseInt(userId, 10));
	return { ...JSON.parse(res), isCacheHit: false };
};

export const action = async (args: ActionFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return json({ success: false, message: "user not found" }, 404);

	switch (args.request.method) {
		case "POST": {
			const data = requestSchema.parse(await args.request.json());
			const outputPromises = data.imgUrls.map((item) => analyseResume(item, data.requirements, user.id));
			const payload = await Promise.all(outputPromises);
			addSession({
				userId: Number.parseInt(user.id, 10),
				createdAt: new Date().toISOString(),
				jobDescription: data.requirements,
				consumedCredits: data.imgUrls.flat().length,
			});
			return json({ success: true, payload }, 200);
		}

		default:
	}
	return json({ success: false, payload: null }, 400);
};

export const meta: MetaFunction = () => {
	return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
	const fetcher = useFetcher();
	const { clientConfig } = useCommonLoader();
	const [images, setImages] = useState<string[][]>([]);
	const [requirements, setRequirements] = useState("");
	const [showOutOfCredits, setShowOutOfCredits] = useState(false);
	const [data, setData] = useState<z.infer<typeof responseSchema>["payload"] | null>(null);
	const [minScore, setMinScore] = useState(0);
	const jobDescriptionLengthLeft = clientConfig.MAX_JOB_DESCRIPTION_LENGTH - requirements.length;

	const submit = (images: string[][]) => {
		if (!images.length || !requirements) return;
		// if (user && user?.creditsLeft <= 0) return setShowOutOfCredits(true);

		fetcher.submit(
			{
				imgUrls: images.map((item) => item.map((item) => item.split(",")[1])),
				requirements,
			},
			{ method: "POST", action: "/?index", encType: "application/json" },
		);
	};

	const convertFilesToImages = async (files: FileList | File[]) => {
		const imagesPromise = Array.from(files).map(convertPDFToImages);
		const images = await Promise.all(imagesPromise);
		setImages(images);
	};

	useEffect(() => {
		if (!fetcher.data) return;

		const res = responseSchema.parse(fetcher.data);
		if (!res.success) return;

		setData(res.payload);
	}, [fetcher.data]);

	useEffect(() => {
		setRequirements(sessionStorage.getItem("requirements") ?? "");
	}, []);

	return (
		<div className="grid grid-rows-[auto_1fr] gap-8 p-4 font-sans">
			<Modal dialog={<OutOfCreditsDialog />} isOpen={showOutOfCredits} onOpenChange={setShowOutOfCredits} />
			{/* <div className="absolute top-0 right-0 m-8 empty:hidden">
				{user ? (
					<div className="flex items-center gap-4">
						<CreditsLeft />
						{user?.pictureUrl && <img className="rounded-full" src={user?.pictureUrl} alt="User" height={48} width={48} />}
						<fetcher.Form action="/auth/log-out" method="POST">
							<Button type="submit">Log Out</Button>
						</fetcher.Form>
					</div>
				) : (
					<Link to="/auth/log-in">Log In</Link>
				)}
			</div> */}

			<CreditsLeft className="ml-auto" />
			<fetcher.Form className="grid justify-items-center gap-12" method="POST" action="/?index" onSubmit={(e) => e.preventDefault()}>
				<Label className="flex size-full flex-col">
					<div className="flex items-baseline">
						<Heading className="mb-2 font-semibold text-lg">Job Requirements</Heading>
						<small className={`ml-auto font-normal text-xs ${jobDescriptionLengthLeft < 50 ? "text-red-500" : "text-gray-600"}`}>
							(&nbsp;
							{clientConfig.MAX_JOB_DESCRIPTION_LENGTH - requirements.length}
							&nbsp; characters left&nbsp;)
						</small>
					</div>
					<TextArea
						className="grow resize-none rounded-lg border border-gray-700 p-4 text-lg focus:outline-gray-600"
						onChange={(e) => {
							setRequirements(e.target.value);
							sessionStorage.setItem("requirements", e.target.value);
						}}
						value={requirements}
						maxLength={clientConfig.MAX_JOB_DESCRIPTION_LENGTH}
						placeholder="The candidate must have atleast X years of experience in Y field and ..."
						rows={10}
					/>
				</Label>
				<DropZone
					className="drop-target:-outline-offset-[12px] grid aspect-video w-[min(600px,100%)] max-w-lg place-content-center justify-items-center gap-4 rounded-2xl border-2 border-gray-700 border-dashed drop-target:bg-black/10 p-4 outline-dashed drop-target:outline-black-40 outline-transparent outline-offset-0 duration-150"
					onDrop={async (e) => {
						const filesPromise = e.items.filter((item) => item.kind === "file").map((item) => item.getFile());

						const directory = e.items.filter((item) => item.kind === "directory");
						for (const entry of directory) {
							const entries = entry.getEntries();
							for await (const entry of entries) {
								if (entry.kind === "file") {
									filesPromise.push(entry.getFile());
								}
							}
						}

						const files = await Promise.all(filesPromise);
						convertFilesToImages(files);
						e.items = [];
					}}
				>
					<LuUploadCloud className="mx-auto size-10" />
					<h2 className="font-semibold text-2xl">Drag and drop files/folder here</h2>
					<div className="flex w-full items-center gap-4">
						<hr className="grow border border-black/10" />
						<p>OR</p>
						<hr className="grow border border-black/10" />
					</div>
					<FileTrigger
						onSelect={async (files) => {
							if (!files) return;
							convertFilesToImages(files);
						}}
						allowsMultiple
						acceptedFileTypes={["application/pdf"]}
					>
						<Button className="flex w-fit items-center gap-2 rounded border-2 border-black px-4 py-2 font-semibold duration-100 hover:bg-black hover:text-white">
							Browse <LuFilePlus2 className="size-4 stroke-[3]" />
						</Button>
					</FileTrigger>
				</DropZone>
				{images.length > 0 && (
					<div className="flex w-full">
						<TooltipTrigger delay={100}>
							<Tooltip className="ml-4 rounded border bg-white p-2 text-gray-500 text-sm" placement="right">
								<OverlayArrow>
									<div className="border-4 border-transparent border-r-white" />
								</OverlayArrow>
								This will consume {images.flat().length} credit(s).
							</Tooltip>
							<Button
								className="mx-auto my-4 flex h-fit items-center gap-2 rounded bg-blue-500 px-4 py-2 font-bold text-lg text-white disabled:cursor-not-allowed disabled:brightness-75"
								onPress={() => submit(images)}
								isDisabled={!requirements}
							>
								Scan <LuSparkles />
							</Button>
						</TooltipTrigger>
						{data && <Filters onFilterUpdate={(filter) => setMinScore(filter.minScore)} />}
					</div>
				)}
			</fetcher.Form>
			<div className="flex max-h-[600px] flex-wrap items-center justify-center gap-8 overflow-y-auto rounded border border-black/20 p-4 text-center empty:hidden">
				{fetcher.state === "submitting" ? (
					<p className="flex items-center gap-2 text-xl">
						Processing... <Spinner className="size-10 fill-black" />
					</p>
				) : data ? (
					<div className="flex flex-col gap-4">
						{data
							.filter((item) => item.score >= minScore)
							.map((item) => (
								<div className="flex max-w-lg items-center gap-4 rounded-lg border p-4" key={item.reason}>
									<CircularProgressBar className="shrink-0" progress={item.score} />
									<div className="flex flex-col gap-2 *:rounded *:border">
										<div>
											<h3 className="font-semibold">Email</h3>
											<p>{item.email}</p>
											<h3 className="font-semibold">Name</h3>
											<p>{item.name}</p>
										</div>
										<div>
											<h3 className="font-semibold">Reason</h3>
											<p>{item.reason}</p>
										</div>
									</div>
								</div>
							))}
					</div>
				) : (
					images.length > 0 && (
						<div className="flex justify-end gap-4">
							{images.map((item, i) => (
								<div key={item[0].slice(500, 600)}>
									<div className="flex w-full justify-between">
										<span className="font-medium text-gray-500 text-sm">{item.length} page(s)</span>
										<Button
											className="mb-1 flex items-center gap-2 rounded-full bg-gray-200 p-1 font-bold text-gray-500 text-lg duration-100 hover:bg-gray-600 hover:text-white"
											onPress={() => setImages((items) => items.filter((_, idx) => idx !== i))}
										>
											<LuX className="size-4 stroke-[3]" />
										</Button>
									</div>
									<img className="rounded border border-gray-600" src={item[0]} alt="resume" width={200} />
								</div>
							))}
						</div>
					)
				)}
			</div>
		</div>
	);
}
