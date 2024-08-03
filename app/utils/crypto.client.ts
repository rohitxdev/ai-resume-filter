const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bufferToBase64 = (buffer: Uint8Array) => {
	const binary = Array.from(buffer)
		.map((byte) => String.fromCharCode(byte))
		.join("");
	return btoa(binary);
};

export const generateSalt = () => {
	const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
	const salt = bufferToBase64(saltBuffer);
	return salt;
};

const generateCryptoKey = async (secretKey: string, salt: Uint8Array) => {
	const secretKeyBuffer = encoder.encode(secretKey);
	const key = await crypto.subtle.importKey("raw", secretKeyBuffer, { name: "PBKDF2" }, false, [
		"deriveBits",
		"deriveKey",
	]);
	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 600000,
			hash: "SHA-256",
		},
		key,
		{ name: "AES-GCM", length: 128 },
		true,
		["encrypt", "decrypt"],
	);
};

export const pbkdf2 = {
	hash: async (text: string, salt: string) => {
		const data = encoder.encode(text);
		const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, [
			"deriveBits",
		]);
		const hashBuffer = await crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt: encoder.encode(salt),
				iterations: 600000,
				hash: "SHA-256",
			},
			key,
			64,
		);
		return bufferToBase64(new Uint8Array(hashBuffer));
	},
	verify: async (text: string, hash: string) => {
		const salt = hash.slice(-24);
		const hashBuffer = await pbkdf2.hash(text, salt);
		return hashBuffer === hash;
	},
} as const;

export const aes = {
	encrypt: async (text: string, secretKey: string) => {
		const data = encoder.encode(text);
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const key = await generateCryptoKey(secretKey, salt);
		const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
		const cipherBuffer = new Uint8Array(cipher);
		const resultBuffer = new Uint8Array(salt.length + iv.length + cipherBuffer.length);
		resultBuffer.set(salt, 0);
		resultBuffer.set(iv, salt.length);
		resultBuffer.set(cipherBuffer, salt.length + iv.length);
		return bufferToBase64(resultBuffer);
	},
	decrypt: async (cipherText: string, secretKey: string) => {
		const cipher = atob(cipherText);
		const bytes = new Uint8Array(cipher.length).map((_item, i) => cipher.charCodeAt(i));
		const salt = bytes.slice(0, 16);
		const iv = bytes.slice(16, 28);
		const data = bytes.slice(28);
		const key = await generateCryptoKey(secretKey, salt);
		const decipher = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
		return decoder.decode(decipher);
	},
} as const;

export const generateMasterKey = async (masterPassword: string, salt: string) => {
	const masterKey = await pbkdf2.hash(masterPassword, salt);
	return masterKey + salt;
};

export const generateApiKey = async (masterKey: string) => {
	const apiKeyBuffer = crypto.getRandomValues(new Uint8Array(32));
	const apiKey = bufferToBase64(apiKeyBuffer);
	const encryptedMasterKey = await aes.encrypt(masterKey, apiKey);
	return { encryptedMasterKey, apiKey };
};

// export const decryptVault = async (salt: string) => {
// 	for (let i = 0; i < 10; i++) {
// 		console.log(i, await generateMasterKey("rohit", "salt"));
// 	}
// 	const secret = "my-super-secret";
// 	const masterPassword = "rohit";
// 	const masterKey = await generateMasterKey(masterPassword, salt);
// 	const encrypted = await aes.encrypt(secret, masterKey);
// 	const { encryptedMasterKey, apiKey } = await generateApiKey(masterKey);
// 	const decryptedVaultKey = await aes.decrypt(encryptedMasterKey, apiKey);
// 	const decrypted = await aes.decrypt(encrypted, decryptedVaultKey);
// 	console.log({ encrypted, encryptedMasterKey, apiKey, decryptedVaultKey, decrypted });
// };
