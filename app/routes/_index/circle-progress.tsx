import type { ComponentProps } from "react";

interface CircleProgressProps extends ComponentProps<"div"> {
	progress: number;
}

const getScoreColor = (score: number) => {
	if (score < 25) return "text-red-500";
	if (score < 50) return "text-orange-400";
	if (score < 75) return "text-yellow-400";
	return "text-green-400";
};

export const CircularProgressBar = ({
	className,
	...props
}: CircleProgressProps) => {
	const radius = 50;
	const strokeWidth = 14;
	const normalizedRadius = radius - strokeWidth / 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset =
		circumference - (props.progress / 100) * circumference;

	return (
		<div className={`relative size-28 ${className}`} {...props}>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg className="w-full h-full" viewBox="0 0 100 100">
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
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
				<span className="text-2xl font-semibold">{`${props.progress}%`}</span>
			</div>
		</div>
	);
};
