<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Parameters</h1>
      <p>Personalize Extinction's weights/thresholds to your liking.</p>
      <p>
        Please be aware that the default values for these settings are NOT based
        on experimentation, but rather only observation. If you find a better
        combination, please feel free to
        <a href="https://github.com/v81d/extinction/pulls">contribute</a>.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold">Non-Destructive Values</h2>
      <p>
        These parameters are not substantial components of Extinction's
        classification process. You can tune them freely as you wish.
      </p>
      <ParamInputField
        storage-key="chunkSize"
        label="Chunk size"
        :step="4"
        :min="128"
        :max="16384"
        placeholder="Enter a number between 128 and 16384"
        :default-value="PARAMETERS.SUSPICION_THRESHOLD"
        description="Controls how many characters are scanned at a time. Smaller chunks make repeated patterns count more, while larger chunks treat the text more as a whole."
        :validate="(v) => Number(v) >= 128 && Number(v) <= 16384"
      />
      <ParamInputField
        storage-key="suspicionThreshold"
        label="Suspicion threshold"
        :step="0.01"
        :min="0"
        :max="1"
        placeholder="Enter a number between 0 and 1"
        :default-value="PARAMETERS.SUSPICION_THRESHOLD"
        description="The threshold above which the detector triggers an alert. The most stable range is between 0.5 and 0.75.
      "
        :validate="(v) => Number(v) >= 0 && Number(v) <= 1"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold">Potentially Destructive Values</h2>
      <p class="text-red-400">
        Editing these values can significantly impact Extinction's results. If
        you don't know what you are doing, please refrain from modifying these
        parameters.
      </p>
      <ParamInputField
        storage-key="adjustmentOffset"
        label="Adjustment Offset"
        :step="0.05"
        :min="-5"
        :max="5"
        placeholder="Enter a number between -5 and 5"
        :default-value="PARAMETERS.ADJUSTMENT_OFFSET"
        description="The horizontal offset of the logistic function used to normalize the raw score. In other words, the threshold above which the score rises begins rising significantly along the sigmoid. A smaller offset increases sensitivity toward AI signals, while a greater offset reduces this. For example, if the offset and normalized alpha are both 0, the resulting score will be 50% (neutral). Make sure to <a href='https://www.desmos.com/calculator/cxvnwttyfv'>test your values</a> before confirming."
        :validate="(v) => Number(v) >= -5 && Number(v) <= 5"
      />
      <ParamInputField
        storage-key="signalCalibrator"
        label="Signal Calibrator"
        :step="0.1"
        :min="1"
        :max="10"
        placeholder="Enter a number between 1 and 10"
        :default-value="PARAMETERS.SIGNAL_CALIBRATOR"
        description="The exponent used to scale each signal score added to the raw alpha during analysis (before normalization). Increasing this value causes fractional signals to decrease and larger signals (greater than 1) to increase."
        :validate="(v) => Number(v) >= 1 && Number(v) <= 10"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { PARAMETERS } from "@/utils/defaults";

import ParamInputField from "./components/ParamInputField.vue";
</script>

<style scoped></style>
