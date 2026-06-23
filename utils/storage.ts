/** Set a key to a value in the browser's storage. */
export async function setData(key: string, value: any): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}

/** Retrieve the value of a key in the browser's storage. */
export async function getData(key: string): Promise<any | null> {
  const value: any | null = await browser.storage.local.get(key);
  return value[key] ?? null;
}

/** Remove a key from the browser's storage. */
export async function removeData(key: string): Promise<void> {
  await browser.storage.local.remove(key);
}
