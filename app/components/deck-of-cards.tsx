import type { CSSProperties } from "react";

interface DeckOfCardsProps {
	imgUrls: string[];
}

export const DeckOfCards = (props: DeckOfCardsProps) => {
	const deckSize = props.imgUrls.length;

	return (
		<div
			className="slide-rotate-reverse my-32 size-64 origin-bottom max-sm:size-32 max-md:my-16 max-md:size-48"
			style={{ "--angle": `${-90 / deckSize}deg` } as CSSProperties}
		>
			{props.imgUrls.map((url, i) => {
				const angle = (i - deckSize / 2) * (90 / deckSize);
				const x = i * 8;
				const y = -i * 8;
				return (
					<img
						className="slide-rotate absolute top-0 left-0 aspect-[3/4] w-64 origin-bottom-left border border-black shadow-[rgb(0,0,0,0.2)_-10px_0_10px]"
						style={
							{
								"--x": `${x}px`,
								"--y": `${y}px`,
								"--angle": `${angle}deg`,
							} as CSSProperties
						}
						src={url}
						width={300}
						height={400}
						alt={`card-${i}`}
						key={url}
					/>
				);
			})}
		</div>
	);
};
