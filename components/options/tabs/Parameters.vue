<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Parameters</h1>
      <p>Personalize Extinction's weights/thresholds to your liking.</p>
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
              @keyup.enter="setSuspicionThreshold(suspicionThresholdInput)"
              v-model="suspicionThresholdInput"
            />

            <span class="px-4 text-xs text-zinc-500">
              The threshold above which the detector triggers an alert.
            </span>
          </div>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            :disabled="
              suspicionThresholdInput < 0 || suspicionThresholdInput > 1
            "
            @click="setSuspicionThreshold(suspicionThresholdInput)"
          >
            Save
          </button>

          <button
            class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
            @click="resetSuspicionThreshold()"
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

const DEFAULT_SUSPICION_THRESHOLD: number = 0.65;

const suspicionThresholdInput = ref<number>(0);

async function setSuspicionThreshold(suspicionThreshold: number) {
  if (suspicionThreshold < 0 || suspicionThreshold > 1) return;
  await setData("suspicionThreshold", suspicionThreshold);
}

async function resetSuspicionThreshold() {
  suspicionThresholdInput.value = DEFAULT_SUSPICION_THRESHOLD;
  await setSuspicionThreshold(DEFAULT_SUSPICION_THRESHOLD);
}

onBeforeMount(async () => {
  let currentSuspicionThreshold: number = await getData("suspicionThreshold");
  if (!currentSuspicionThreshold) {
    // set default suspicion threshold
    await setData("suspicionThreshold", DEFAULT_SUSPICION_THRESHOLD);
    currentSuspicionThreshold = DEFAULT_SUSPICION_THRESHOLD;
  }

  suspicionThresholdInput.value = currentSuspicionThreshold;
});
</script>

<style scoped></style>
