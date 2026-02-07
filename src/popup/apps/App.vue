<template>
  <div
    class="flex flex-col items-center w-full h-full text-base bg-(--color-bg-primary)"
  >
    <header
      class="flex justify-between items-stretch text-center p-3 w-full bg-(--color-panel-primary)"
      v-if="currentDomain && currentPage"
    >
      <div class="flex justify-start items-center">
        <p class="whitespace-nowrap overflow-hidden text-ellipsis font-bold">
          <span>{{ currentDomain }}</span>
        </p>
      </div>
      <div class="flex justify-end items-center gap-3">
        <button
          class="cursor-pointer flex justify-center items-center text-center text-(--color-actionrow-button-text-primary) transition-transform active:scale-75"
          v-tippy="'Reload score'"
          @click="loadScore"
        >
          <Refresh />
        </button>
        <button
          class="cursor-pointer flex justify-center items-center text-center text-(--color-actionrow-button-text-primary) transition-transform active:scale-75"
          v-tippy="
            exceptionsList.includes(currentDomain)
              ? 'Enable scans'
              : exceptionsList.includes(currentPage)
                ? 'Disable scans for domain'
                : 'Disable scans for page'
          "
          @click="toggleDomainException"
        >
          <ScanOff
            class="text-(--color-actionrow-button-text-red)"
            v-if="exceptionsList.includes(currentDomain)"
          />
          <ScanOff
            class="text-(--color-actionrow-button-text-yellow)"
            v-else-if="exceptionsList.includes(currentPage)"
          />
          <ScanOn class="text-(--color-actionrow-button-text-green)" v-else />
        </button>
      </div>
    </header>
    <section
      class="flex flex-col justify-center items-center text-center p-10 w-full"
    >
      <div
        class="flex flex-col justify-center items-center text-center gap-2"
        v-if="
          currentDomain &&
          currentPage &&
          !exceptionsList.includes(currentDomain) &&
          !exceptionsList.includes(currentPage) &&
          score !== null
        "
      >
        <p>We are</p>
        <p class="text-3xl font-mono font-bold">
          {{ (score * 100).toFixed(2) }}%
        </p>
        <p>confident that this page contains AI-generated content.</p>
      </div>
      <p v-else>
        <span v-if="currentDomain && exceptionsList.includes(currentDomain)"
          >Scans are not enabled for this domain.</span
        >
        <span v-else-if="currentPage && exceptionsList.includes(currentPage)"
          >Scans are not enabled for this page.</span
        >
        <span v-else-if="articleTooShort === true"
          >This page is too short to be scanned.</span
        >
        <span v-else>No score is available for this page.</span>
      </p>
    </section>
    <footer
      class="flex justify-center items-center p-3 w-full text-center bg-(--color-panel-primary)"
    >
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        Information is subject to errors.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import browser from "webextension-polyfill";
import { ref, onMounted } from "vue";
import { setData, getData } from "@/utils/storage";

import {
  AiFillSecurityScan as ScanOn,
  AiOutlineSecurityScan as ScanOff,
} from "vue-icons-plus/ai";
import { BiRefresh as Refresh } from "vue-icons-plus/bi";

import { directive as VTippy } from "vue-tippy";
import "tippy.js/dist/tippy.css";

const articleTooShort = ref<boolean | null>(null);
const score = ref<number | null>(null);
const currentDomain = ref<string | null>(null);
const currentPage = ref<string | null>(null);
const exceptionsList = ref<string[]>([]);

onMounted(async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const url: string | null = tabs[0]?.url ?? null;

  if (url) {
    const u: URL = new URL(url);
    currentDomain.value = u.hostname;
    currentPage.value = u.hostname + u.pathname;
  }

  exceptionsList.value = (await getData("exceptionsList")) ?? [];

  await loadScore();
});

async function loadScore() {
  if (
    !currentDomain.value ||
    exceptionsList.value.includes(currentDomain.value)
  )
    score.value = null;
  else {
    const response = (await browser.runtime.sendMessage({
      type: `GET_CLASSIFIER_SCORE_${currentDomain.value}`,
    })) as { value: any };

    articleTooShort.value = response.value === "ARTICLE_TOO_SHORT";

    score.value =
      !response.value ||
      isNaN(response.value) ||
      response.value === "ARTICLE_TOO_SHORT"
        ? null
        : Math.min(1, Math.max(0, Number(response.value)));
  }
}

async function toggleDomainException() {
  if (!currentDomain.value || !currentPage.value) return;
  const domain: string = currentDomain.value;
  const page: string = currentPage.value;

  if (exceptionsList.value.includes(domain)) {
    // Remove domain from exceptions
    exceptionsList.value = exceptionsList.value.filter((d) => d !== domain);
    await loadScore();
  } else if (exceptionsList.value.includes(page)) {
    // Remove page and add domain to exceptions
    exceptionsList.value = exceptionsList.value.filter((p) => p !== page);
    exceptionsList.value = [...exceptionsList.value, domain];
  } else {
    // Add page to exceptions
    exceptionsList.value = [...exceptionsList.value, page];
  }

  await setData("exceptionsList", [...exceptionsList.value]);
}
</script>

<style scoped>
* {
  --color-bg-primary: #212b4f;

  --color-panel-primary: #435182;

  --color-actionrow-button-text-primary: #8997c4;
  --color-actionrow-button-text-green: #89c4a5;
  --color-actionrow-button-text-yellow: #c4bb89;
  --color-actionrow-button-text-red: #c49089;

  --color-text-primary: #aab9ed;
}

p,
span,
button {
  color: var(--color-text-primary);
}
</style>
