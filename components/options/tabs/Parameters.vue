<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Parameters</h1>
      <p>Personalize Extinction's weights/thresholds to your liking.</p>
    </section>

    <InputField
      storage-key="chunkSize"
      label="Chunk size"
      :step="4"
      :min="128"
      :max="16384"
      placeholder="Enter a number between 128 and 16384"
      :default-value="1024"
      description="Controls how many characters are scanned at a time. Smaller chunks make repeated patterns count more, while larger chunks treat the text more as a whole."
      :validate="(v) => Number(v) >= 128 && Number(v) <= 16384"
    />

    <InputField
      storage-key="suspicionThreshold"
      label="Suspicion threshold"
      :step="0.01"
      :min="0"
      :max="1"
      placeholder="Enter a number between 0 and 1"
      :default-value="0.65"
      description="The threshold above which the detector triggers an alert. The most stable range is between <code class='bg-zinc-950 px-1 py-0.5 rounded text-xs'>0.50</code> and <code class='bg-zinc-950 px-1 py-0.5 rounded text-xs'>0.75</code>.
      "
      :validate="(v) => Number(v) >= 0 && Number(v) <= 1"
    />
  </div>
</template>

<script setup lang="ts">
import InputField from "./components/InputField.vue";
</script>

<style scoped></style>
