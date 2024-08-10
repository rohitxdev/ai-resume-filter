export class MemoryCache<K, V> {
	#kv: Map<K, V>;
	#ttls: Map<K, number>;
	#checkInterval: number;

	/**
	 *
	 * @param checkInterval interval in milliseconds
	 */
	constructor(checkInterval: number) {
		this.#kv = new Map<K, V>();
		this.#ttls = new Map<K, number>();
		this.#checkInterval = checkInterval;

		setInterval(() => {
			for (const [key, ttl] of this.#ttls.entries()) {
				if (ttl < Date.now()) {
					this.#kv.delete(key);
					this.#ttls.delete(key);
				}
			}
		}, this.#checkInterval);
	}

	get(key: K) {
		return this.#kv.get(key);
	}
	/**
	 *
	 * @param key
	 * @param value
	 * @param ttl TTL - time to live in milliseconds
	 */
	set(key: K, value: V, ttl?: number) {
		this.#kv.set(key, value);
		if (ttl) {
			this.#ttls.set(key, Date.now() + ttl);
		}
	}
	delete(key: K) {
		this.#kv.delete(key);
		this.#ttls.delete(key);
	}
	clear() {
		this.#kv.clear();
		this.#ttls.clear();
	}
}

const THIRTY_SECONDS = 30 * 1000;

export const cache = new MemoryCache<string, string>(THIRTY_SECONDS);
