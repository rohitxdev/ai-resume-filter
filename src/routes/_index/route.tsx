import { Link } from "@remix-run/react";
import { LuCheckCircle } from "react-icons/lu";
import { DeckOfCards } from "~/components/deck-of-cards";

const Route = () => {
	return (
		<div className="grid justify-items-center gap-16 overflow-x-hidden p-8">
			<div className="grid justify-items-center gap-4">
				<h1 className="font-bold text-4xl">Streamline Your Hiring with AI-Powered Resume Filtering.</h1>
				<h2 className="text-xl">Find top talent faster and more accurately than ever before.</h2>
				<ul className="mx-auto mt-8 space-y-4 *:flex *:items-center *:gap-2 [&_svg]:stroke-[3]">
					<li>
						<LuCheckCircle /> Multiple file formats (PDF, DOC, JPG, PNG)
					</li>
					<li>
						<LuCheckCircle /> 98% accuracy
					</li>
					<li>
						<LuCheckCircle /> Scans low quality images
					</li>
					<li>
						<LuCheckCircle /> Understands complex job requirements
					</li>
				</ul>
			</div>
			<DeckOfCards imgUrls={["/resume-1.png", "/resume-2.png", "/resume-3.png", "/resume-4.png", "/resume-5.png", "/resume-6.png"]} />
			<p className="text-center font-semibold text-2xl">Blitz through 1000s of resumes in seconds.</p>
			<div className="flex flex-col items-center gap-4">
				<Link className="rounded-md bg-twine-500 px-6 py-4 font-semibold text-2xl" to="/app">
					Try now
				</Link>
				<small className="text-sm">
					Get <span className="font-bold">10</span> free credits when you sign up.
				</small>
			</div>
		</div>
	);
};

export default Route;
