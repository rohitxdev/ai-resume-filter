import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ENDPOINT}`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

export const uploadToR2 = async (base64Url: string, fileName: string) => {
	const buffer = Buffer.from(base64Url, "base64");

	try {
		await s3Client.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: fileName,
				Body: buffer,
				ContentType: "image/png",
				ContentLength: buffer.length,
			}),
		);
		return `${process.env.R2_PUBLIC_ENDPOINT}/${fileName}`;
	} catch (error) {
		console.error("Error uploading file:", error);
		throw error;
	}
};
