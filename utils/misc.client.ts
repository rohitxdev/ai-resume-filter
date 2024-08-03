export const convertFileToBase64 = (file: File) => {
	const fileReader = new FileReader();
	return new Promise((resolve, reject) => {
		fileReader.onload = (e) => resolve(e.target?.result as string);
		fileReader.onerror = reject;
		fileReader.readAsDataURL(file);
	});
};
