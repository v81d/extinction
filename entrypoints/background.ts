import { setData, getData } from "@/utils/storage";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    async (message: any): Promise<{ value: any } | void> => {
      if (!message.type || typeof message.type !== "string") return;

      const key = message.type.replace(/^GET_|^SET_/, "");

      if (message.type.startsWith("GET_"))
        // get a value from store
        return { value: (await getData(key)) ?? null };

      // set a value in store
      if (message.type.startsWith("SET_")) await setData(key, message.value);
    },
  );
});
