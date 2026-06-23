<template>
  <div class="flex flex-col w-full h-full text-zinc-200 bg-zinc-900">
    <header class="flex items-center gap-4 px-4 py-2 w-full bg-zinc-800">
      <img src="/icon/32.png" alt="Extinction" title="Extinction" />
      <TabBar :tabs="TABS" :state="tabBarState" />
    </header>

    <main class="flex-1"></main>
  </div>
</template>

<script setup lang="ts">
import { directive as VTippy } from "vue-tippy";
import "tippy.js/dist/tippy.css";

import TabBar from "@/components/options/TabBar.vue";

/** The array of tabs to show in the header. */
const TABS = ["About", "Trusted Sites"];

/** The tab bar state. */
const tabBarState = {
  activeTab: ref<number>(0),
};
</script>

<style scoped></style>
