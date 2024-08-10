import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { LuChevronDown, LuChevronUp, LuExternalLink, LuFileText } from "react-icons/lu";

interface CircleProgressProps extends ComponentProps<"div"> {
	progress: number;
}

const getScoreColor = (score: number) => {
	if (score < 25) return "text-red-500";
	if (score < 50) return "text-orange-400";
	if (score < 75) return "text-yellow-400";
	return "text-green-400";
};

export const CircularProgressBar = ({ className, ...props }: CircleProgressProps) => {
	const radius = 50;
	const strokeWidth = 14;
	const normalizedRadius = radius - strokeWidth / 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - (props.progress / 100) * circumference;

	return (
		<div className={`relative size-28 shrink-0 ${className}`} {...props}>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg className="h-full w-full" viewBox="0 0 100 100">
				<circle
					className="text-black/10"
					strokeWidth={strokeWidth}
					stroke="currentColor"
					fill="transparent"
					r={normalizedRadius}
					cx="50"
					cy="50"
				/>
				<circle
					className={getScoreColor(props.progress)}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					style={{ strokeDashoffset }}
					strokeLinecap="round"
					stroke="currentColor"
					fill="transparent"
					r={normalizedRadius}
					cx="50"
					cy="50"
				/>
			</svg>
			<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform text-center">
				<span className="font-semibold text-2xl">{`${props.progress}%`}</span>
			</div>
		</div>
	);
};

interface CandidateDetailsProps {
	progress: number;
	name: string;
	email: string;
	reason: string;
	resumeUrl: string;
}

export const CandidateDetails = (props: CandidateDetailsProps) => {
	const [showReason, setShowReason] = useState(false);
	const urlRef = useRef(props.resumeUrl);

	useEffect(() => {
		fetch(props.resumeUrl)
			.then((res) => res.blob())
			.then((blob) => {
				urlRef.current = URL.createObjectURL(blob);
			});
	}, [props.resumeUrl]);

	return (
		<div className="flex w-full flex-col gap-4 rounded-lg border border-black/20 p-4">
			<div className="flex gap-4">
				<CircularProgressBar progress={props.progress} />
				<div className="flex flex-col items-start gap-1">
					<p className="font-semibold text-xl">{props.name}</p>
					<a className="group text-gray-600 underline-offset-2 hover:underline" href={`mailto:${props.email}`}>
						{props.email}
						<LuExternalLink className="mb-1 ml-2 inline-block size-4 stroke-[3] opacity-0 duration-100 group-hover:opacity-100" />
					</a>
					<div className="flex gap-2">
						<Button
							className="flex items-center gap-2 rounded-full bg-blue-300/50 px-4 py-2 font-semibold text-blue-600 text-sm [&>svg]:stroke-[3]"
							onPress={() => setShowReason((val) => !val)}
						>
							View reason {showReason ? <LuChevronUp /> : <LuChevronDown />}
						</Button>
						<a
							className="flex items-center gap-2 rounded-full bg-blue-300/50 px-4 py-2 font-semibold text-blue-600 text-sm"
							href={urlRef.current}
							target="_blank"
							rel="noreferrer"
						>
							View resume <LuFileText className="size-4" />
						</a>
					</div>
				</div>
			</div>
			<div className={`grid duration-100 ${showReason ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
				<p className="overflow-hidden text-start font-medium text-gray-700 text-sm">{props.reason}</p>
			</div>
		</div>
	);
};
