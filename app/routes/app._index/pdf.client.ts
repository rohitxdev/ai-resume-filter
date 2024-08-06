import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

export const convertPDFToImages = async (pdfFile: File) => {
	const fileBuffer = await pdfFile.arrayBuffer();
	const pdf = await getDocument(fileBuffer).promise;

	const images: string[] = [];

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if (!context) return images;

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const viewport = page.getViewport({ scale: 2 });

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		await page.render({
			canvasContext: context,
			viewport,
		}).promise;

		images.push(canvas.toDataURL("image/png"));
	}

	return images;
};
