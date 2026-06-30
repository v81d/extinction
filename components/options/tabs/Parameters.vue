<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Parameters</h1>
      <p>Personalize Extinction's weights/thresholds to your liking.</p>
    </section>

    <!-- Chunk size -->
    <section>
      <div class="flex flex-col gap-2">
        <label class="px-4 font-bold">Chunk size</label>

        <div
          class="grid grid-cols-1 lg:grid-cols-[6fr_1fr_1fr] items-start gap-2"
        >
          <div class="flex flex-col gap-2">
            <input
              class="px-4 py-4 lg:py-2 text-sm outline-none rounded-lg bg-zinc-800"
              type="number"
              step="4"
              min="128"
              max="16384"
              placeholder="Enter a number between 128 and 16384"
              @keyup.enter="
                setConstant(
                  'chunkSize',
                  chunkSizeInput,
                  chunkSizeInput !== undefined &&
                    chunkSizeInput >= 128 &&
                    chunkSizeInput <= 16384,
                )
              "
              v-model="chunkSizeInput"
            />

            <span class="px-4 text-xs text-zinc-500">
              Controls how many characters are scanned at a time. Smaller chunks
              make repeated patterns count more, while larger chunks treat the
              text more as a whole.
            </span>
          </div>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            :disabled="
              chunkSizeInput === undefined ||
              chunkSizeInput < 128 ||
              chunkSizeInput > 16384
            "
            @click="
              setConstant(
                'chunkSize',
                chunkSizeInput,
                chunkSizeInput !== undefined &&
                  chunkSizeInput >= 128 &&
                  chunkSizeInput <= 16384,
              )
            "
          >
            Save
          </button>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            @click="
              resetConstant(
                'chunkSize',
                (v) => (chunkSizeInput = v),
                DEFAULT_CHUNK_SIZE,
              )
            "
          >
            Default
          </button>
        </div>
      </div>
    </section>

    <!-- Detection threshold -->
    <section>
      <div class="flex flex-col gap-2">
        <label class="px-4 font-bold">Suspicion threshold</label>

        <div
          class="grid grid-cols-1 lg:grid-cols-[6fr_1fr_1fr] items-start gap-2"
        >
          <div class="flex flex-col gap-2">
            <input
              class="px-4 py-4 lg:py-2 text-sm outline-none rounded-lg bg-zinc-800"
              type="number"
              step="0.01"
              placeholder="Enter a number between 0 and 1"
              @keyup.enter="
                setConstant(
                  'suspicionThreshold',
                  suspicionThresholdInput,
                  suspicionThresholdInput !== undefined &&
                    suspicionThresholdInput >= 0 &&
                    suspicionThresholdInput <= 1,
                )
              "
              v-model="suspicionThresholdInput"
            />

            <span class="px-4 text-xs text-zinc-500">
              The threshold above which the detector triggers an alert. The most
              stable range is between
              <code class="bg-zinc-950 px-1 py-0.5 rounded text-xs">0.50</code>
              and
              <code class="bg-zinc-950 px-1 py-0.5 rounded text-xs">0.75</code>.
            </span>
          </div>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            :disabled="
              suspicionThresholdInput === undefined ||
              suspicionThresholdInput < 0 ||
              suspicionThresholdInput > 1
            "
            @click="
              setConstant(
                'suspicionThreshold',
                suspicionThresholdInput,
                suspicionThresholdInput !== undefined &&
                  suspicionThresholdInput >= 0 &&
                  suspicionThresholdInput <= 1,
              )
            "
          >
            Save
          </button>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            @click="
              resetConstant(
                'suspicionThreshold',
                (v) => (suspicionThresholdInput = v),
                DEFAULT_SUSPICION_THRESHOLD,
              )
            "
          >
            Default
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { setData, getData } from "@/utils/storage";

const DEFAULT_CHUNK_SIZE = 1024;
const DEFAULT_SUSPICION_THRESHOLD: number = 0.65;

const chunkSizeInput = ref<number>();
const suspicionThresholdInput = ref<number>();

async function setConstant(
  constant: string,
  value: any,
  constraint?: boolean | 0,
) {
  if (constraint === false) return;
  await setData(constant, value);
}

async function resetConstant<T>(
  constant: string,
  setValue: (v: T) => void,
  defaultValue: T,
) {
  setValue(defaultValue);
  await setConstant(constant, defaultValue);
}

async function loadConstant(constant: string, defaultValue: any) {
  let currentValue: any = await getData(constant);
  if (currentValue === undefined || currentValue === null) {
    await setData(constant, defaultValue);
    currentValue = defaultValue;
  }

  return currentValue;
}

onBeforeMount(async () => {
  chunkSizeInput.value = await loadConstant("chunkSize", DEFAULT_CHUNK_SIZE);
  suspicionThresholdInput.value = await loadConstant(
    "suspicionThreshold",
    DEFAULT_SUSPICION_THRESHOLD,
  );
});
</script>

<style scoped></style>
