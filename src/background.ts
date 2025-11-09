let messages: Record<string, any> = {};

browser.runtime.onMessage.addListener(
  (message: any): Promise<{ value: any }> | void => {
    if (!message.type || typeof message.type !== "string") return;

    const key = message.type.replace(/^GET_|^SET_/, "");

    // Get a value
    if (message.type.startsWith("GET_")) {
      return Promise.resolve({
        value: messages[key] ?? "N/A",
      });
    }

    // Set a value
    if (message.type.startsWith("SET_")) messages[key] = message.value;
  },
);
