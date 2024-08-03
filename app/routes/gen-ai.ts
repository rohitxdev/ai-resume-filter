import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
	generationConfig: { responseMimeType: "application/json" },
});

export const scanResume = async (requirements: string, imgUrls: string[]) => {
	const prompt = `I'll give you a job description from the next paragraph. Read it and tell me if the resume in the image is eligible for it in pure json output only with the structure {score:integer,reason:string,email:string,name:string}. Score should be calculated based on how many requirements the candidate passes. 0 for none, 100 for all. For other cases, approximate the score and round off based on how many requirements are passed. Reason should be 20 to 40 words long. If email/name can't be read, give --.\n\n${requirements}\n\n`;

	const { response } = await model.generateContent([
		prompt,
		...imgUrls.map((item) => ({ inlineData: { data: item, mimeType: "image/png" } })),
	]);
	return response.text();
};
