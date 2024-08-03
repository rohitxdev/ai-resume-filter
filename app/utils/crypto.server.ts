import xxhash from "xxhash-wasm";

const { h64ToString } = await xxhash();

export const xxhashSync = {
	hash: (data: string) => h64ToString(data),
	verify: (data: string, hash: string) => xxhashSync.hash(data) === hash,
};
