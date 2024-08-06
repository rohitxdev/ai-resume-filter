import { DeckOfCards } from "~/components/deck-of-cards";

export default function og() {
	return (
		<div className="grid h-screen w-screen place-content-center">
			<div className="flex aspect-[1.91/1] items-center justify-center gap-72 pr-72 pl-20 ring">
				<div className="max-w-[1000px] space-y-8">
					<h1 className="w-full text-pretty font-bold text-[5rem] leading-[1]">
						Find top talent faster and more accurately than ever before.
					</h1>
					<p className="text-[2rem]">Streamline your hiring with AI-Powered resume filtering.</p>
				</div>
				<DeckOfCards imgUrls={["/resume-1.png", "/resume-2.png", "/resume-3.png", "/resume-4.png", "/resume-5.png", "/resume-6.png"]} />
			</div>
		</div>
	);
}
