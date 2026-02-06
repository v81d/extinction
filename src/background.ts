import browser from "webextension-polyfill";
import { setData, getData } from "@/utils/storage";

browser.runtime.onMessage.addListener(
  async (message: any): Promise<{ value: any } | void> => {
    if (!message.type || typeof message.type !== "string") return;

    const key = message.type.replace(/^GET_|^SET_/, "");

    // Get a value
    if (message.type.startsWith("GET_")) {
      const value = await getData(key);
      return { value: value ?? null };
    }

    // Set a value
    if (message.type.startsWith("SET_")) {
      await setData(key, message.value);
    }
  },
);
