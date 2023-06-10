export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function nop(): Promise<void> {
  await sleep(0);
}

export type Entry<K, V> = {
  key: K;
  value: V;
};

export class KVStore<K, V> {
  constructor(public entries: Array<Entry<K, V>> = []) {}

  static get<K, V>(kvStore: KVStore<K, V>, key: K): V | undefined {
    const entry = kvStore.entries.find((e) => e.key === key);
    return entry?.value;
  }

  static set<K, V>(kvStore: KVStore<K, V>, key: K, value: V): void {
    const entry = kvStore.entries.find((e) => e.key === key);
    if (entry) {
      entry.value = value;
    } else {
      kvStore.entries.push({ key, value });
    }
  }

  static entries<K, V>(kvStore: KVStore<K, V>): Array<Entry<K, V>> {
    return kvStore.entries;
  }

  static has<K, V>(kvStore: KVStore<K, V>, key: K): boolean {
    return kvStore.entries.find((e) => e.key === key) !== undefined;
  }
}
