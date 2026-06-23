<template>
  <div class="flex gap-1 p-1 rounded-lg bg-zinc-700/50">
    <button
      v-for="(tab, i) in props.tabs"
      :key="i"
      class="cursor-pointer px-4 py-2 text-sm text-zinc-200 rounded-lg"
      :class="
        i === props.state.activeTab.value
          ? 'bg-zinc-600'
          : 'hover:bg-zinc-600/50'
      "
      @click="props.state.activeTab.value = i"
    >
      {{ tab }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tabs: string[];
  state: {
    activeTab: Ref<number>;
  };
}>();
</script>

<style scoped></style>
