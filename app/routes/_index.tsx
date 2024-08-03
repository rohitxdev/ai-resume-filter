import { type ActionFunctionArgs, type MetaFunction, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
	Button,
	Dialog,
	DialogTrigger,
	DropZone,
	FileTrigger,
	Heading,
	Label,
	Popover,
	Slider,
	SliderOutput,
	SliderThumb,
	SliderTrack,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	TextArea,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";
import {
	LuHistory,
	LuHome,
	LuImage,
	LuSlidersHorizontal,
	LuSparkles,
	LuUploadCloud,
	LuX,
} from "react-icons/lu";
import { z } from "zod";
import { cache } from "../../utils/cache.server";
import { xxhashSync } from "../../utils/crypto.server";
import { scanResume } from "./gen-ai";
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

const analyseResume = async (imgUrls: string[], requirements: string) => {
	const key = xxhashSync.hash(requirements + imgUrls.join());
	const cachedData = cache.get(key);
	const isCacheHit = cachedData !== null;
	if (isCacheHit) return { ...JSON.parse(cachedData), isCacheHit };

	const res = await scanResume(requirements, imgUrls);
	cache.set(key, res);
	return { ...JSON.parse(res), isCacheHit };
};

export const action = async (args: ActionFunctionArgs) => {
	switch (args.request.method) {
		case "POST": {
			const data = requestSchema.parse(await args.request.json());
			const outputPromises = data.imgUrls.map((item) =>
				analyseResume(item, data.requirements),
			);
			const payload = await Promise.all(outputPromises);
			return json({ success: true, payload }, 200);
		}

		default:
	}
	return json({ success: false, payload: null }, 400);
};

export const meta: MetaFunction = () => {
	return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

const getScoreColor = (score: number) => {
	if (score < 25) return "red";
	if (score < 50) return "orange";
	if (score < 75) return "yellow";
	return "green";
};

interface Filter {
	minScore: number;
}

interface FiltersProps {
	onFilterUpdate: (filter: Filter) => void;
}

const Filters = (props: FiltersProps) => {
	return (
		<DialogTrigger>
			<Button>
				<LuSlidersHorizontal className="size-5 text-black" />
			</Button>
			<Popover>
				<Dialog className="rounded-md border bg-white p-4 text-center outline-none">
					<Heading>Filters</Heading>
					<Slider
						className="w-64"
						defaultValue={0}
						onChange={(val) => props.onFilterUpdate({ minScore: val })}
					>
						<div className="flex w-full justify-between text-gray-400">
							<Label>Minimum Score</Label>
							<SliderOutput />
						</div>
						<SliderTrack className="relative h-7 w-full">
							{({ state }) => (
								<>
									<div className="absolute top-[50%] h-2 w-full translate-y-[-50%] rounded-full bg-gray-200" />
									<div
										className={`absolute top-[50%] h-2 translate-y-[-50%] rounded-full duration-75 ${state.isThumbDragging(0) ? "bg-gray-700" : "bg-gray-400"}`}
										style={{ width: `${state.getThumbPercent(0) * 100}%` }}
									/>
									<SliderThumb className="top-[50%] h-5 w-3 rounded-sm border border-solid bg-gray-400 dragging:bg-gray-600 outline-none ring-black transition duration-75 focus-visible:ring-2" />
								</>
							)}
						</SliderTrack>
					</Slider>
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
};

export default function Index() {
	const fetcher = useFetcher();
	const [images, setImages] = useState<string[][]>([]);
	const [requirements, setRequirements] = useState("");
	const [data, setData] = useState<z.infer<typeof responseSchema>["payload"] | null>(null);
	const [minScore, setMinScore] = useState(0);

	const submit = (images: string[][]) => {
		if (!images.length || !requirements) return;

		fetcher.submit(
			{ imgUrls: images.map((item) => item.map((item) => item.split(",")[1])), requirements },
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
		<div className="grid h-screen w-screen max-w-5xl grid-rows-[auto_1fr] place-content-center justify-items-center gap-8 p-4 font-sans">
			<h1 className="text-center font-bold text-4xl">
				Streamline Your Hiring with AI-Powered Resume Filtering
			</h1>
			<Tabs
				className="grid size-full grid-cols-[auto_1fr] gap-4 *:rounded-lg *:border *:bg-white *:p-4 last:*:p-8"
				orientation="horizontal"
			>
				<TabList className="*:flex *:w-36 *:items-center *:gap-2 *:rounded *:border *:border-transparent *:p-2 *:outline-none hover:*:border hover:*:bg-gray-100 focus:*:border-gray-200 focus:*:bg-gray-100">
					<Tab id="home">
						<LuHome /> Home
					</Tab>
					<Tab id="history">
						<LuHistory /> History
					</Tab>
				</TabList>
				<TabPanel id="home">
					<fetcher.Form
						className="grid justify-items-center gap-4"
						method="POST"
						action="/?index"
						onSubmit={(e) => e.preventDefault()}
					>
						<Label>
							<Heading className="mb-2 font-semibold text-lg">
								Job Requirements
							</Heading>
							<TextArea
								className="aspect-[2/1] w-full min-w-[60ch] resize-none rounded-lg border border-gray-700 p-4 text-lg focus:outline-gray-600"
								onChange={(e) => {
									setRequirements(e.target.value);
									sessionStorage.setItem("requirements", e.target.value);
								}}
								value={requirements}
							/>
						</Label>
						<DropZone
							className="drop-target:-outline-offset-[12px] grid aspect-video w-full min-w-[400px] max-w-lg place-content-center justify-items-center gap-8 rounded-2xl border-2 border-gray-700 border-dashed drop-target:bg-gray-200 p-4 outline-dashed drop-target:outline-gray-400 outline-transparent outline-offset-0 duration-150"
							onDrop={async (e) => {
								const filesPromise = e.items
									.filter((item) => item.kind === "file")
									.map((item) => item.getFile());

								const directory = e.items.filter(
									(item) => item.kind === "directory",
								);
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
							<h2 className="font-semibold text-2xl">
								Drag and drop files/folder here
							</h2>
							<FileTrigger
								onSelect={async (files) => {
									if (!files) return;
									convertFilesToImages(files);
								}}
								allowsMultiple
								acceptedFileTypes={["application/pdf"]}
							>
								<Button className="flex w-fit items-center gap-2 rounded border border-gray-400 p-2">
									Browse <LuImage />
								</Button>
							</FileTrigger>
						</DropZone>
						<div className="flex w-full">
							<TooltipTrigger delay={100}>
								<Tooltip
									className="mb-2 rounded border bg-white p-2"
									placement="right"
								>
									This will consume {images.flat().length} credits.
								</Tooltip>
								<Button
									className="mx-auto my-4 flex items-center gap-2 rounded bg-blue-500 px-4 py-2 font-bold text-lg text-white disabled:cursor-not-allowed disabled:brightness-75"
									onPress={() => submit(images)}
									isDisabled={!requirements}
								>
									Run <LuSparkles />
								</Button>
							</TooltipTrigger>
							{images.length > 0 && (
								<Filters
									onFilterUpdate={(filter) => setMinScore(filter.minScore)}
								/>
							)}
						</div>
					</fetcher.Form>
					<div className="flex max-h-[600px] flex-wrap items-center justify-center gap-8 overflow-y-auto border p-2 text-center empty:hidden">
						{fetcher.state === "submitting" ? (
							<p className="text-xl">Processing...</p>
						) : data ? (
							<div className="flex flex-col gap-4">
								{data
									.filter((item) => item.score >= minScore)
									.map((item) => (
										<div
											className="flex max-w-lg items-center gap-4 rounded-lg border p-4"
											key={item.reason}
										>
											<div
												className="float-left rounded-full border-8 p-4 font-bold text-xl"
												style={{ borderColor: getScoreColor(item.score) }}
											>
												<h3 className="font-semibold">Score</h3>
												{item.score}
											</div>
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
							<div className="flex justify-end gap-4">
								{images.map((item, i) => (
									<div key={item[0].slice(500, 600)}>
										<div className="flex w-full justify-between">
											<span className="font-medium text-gray-400 text-sm">
												{item.length} page(s)
											</span>
											<Button
												className="mb-1 flex items-center gap-2 rounded-full bg-gray-200 p-1 font-bold text-gray-400 text-lg duration-100 hover:bg-gray-600 hover:text-white"
												onPress={() =>
													setImages((items) =>
														items.filter((_, idx) => idx !== i),
													)
												}
											>
												<LuX className="size-4 stroke-[3]" />
											</Button>
										</div>
										<img
											className="rounded border border-gray-600"
											src={item[0]}
											alt="resume"
											width={200}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</TabPanel>
				<TabPanel id="history">
					<h1>History</h1>
				</TabPanel>
			</Tabs>
		</div>
	);
}
