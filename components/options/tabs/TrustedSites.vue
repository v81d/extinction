<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">Trusted Sites</h1>
      <p>View or manage your trusted sites here.</p>
    </section>

    <section>
      <div class="grid grid-cols-1 lg:grid-cols-[3fr_1fr] items-start gap-6">
        <!-- Input -->
        <div class="flex flex-col gap-2">
          <input
            class="px-4 py-4 lg:py-2 text-sm outline-none rounded-lg bg-zinc-800"
            type="text"
            placeholder="Enter domain or page URL"
            @keyup.enter="addException(siteInput)"
            v-model="siteInput"
          />
          <span class="px-4 text-xs text-zinc-500">
            Supports wildcards and glob patterns:
            <code class="bg-zinc-950 px-1 py-0.5 rounded text-xs"
              >*.example.com</code
            >,
            <code class="bg-zinc-950 px-1 py-0.5 rounded text-xs"
              >example.com/*</code
            >,
            <code class="bg-zinc-950 px-1 py-0.5 rounded text-xs"
              >example.com/page/*</code
            >.
          </span>
        </div>

        <!-- Add button -->
        <button
          class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
          :disabled="!siteInput.trim()"
          @click="addException(siteInput)"
        >
          Add Exception
        </button>

        <!-- List -->
        <div
          class="overflow-y-auto h-64 flex flex-col gap-1 p-2 text-sm rounded-lg bg-zinc-800"
        >
          <button
            v-for="exception in exceptionsList"
            :key="exception"
            @click="toggleExceptionItem(exception)"
            class="text-left w-full px-4 py-4 lg:py-2 rounded-lg"
            :class="
              selectedExceptions.includes(exception)
                ? 'bg-zinc-600'
                : 'hover:bg-zinc-700'
            "
          >
            {{ exception }}
          </button>
        </div>

        <!-- Remove button -->
        <button
          class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
          :disabled="!selectedExceptions.length"
          @click="removeExceptions(selectedExceptions)"
        >
          Remove Selected
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { setData, getData } from "@/utils/storage";

/** The currently selected excluded domain or page. */
const selectedExceptions = ref<string[]>([]);
/** The list of excluded domains and pages set by the user. */
const exceptionsList = ref<string[]>([]);

/** The user's domain or page input. */
const siteInput = ref<string>("");

/** Toggle an item in the exceptions list UI. */
function toggleExceptionItem(exception: string) {
  const index: number = selectedExceptions.value.indexOf(exception);

  if (index === -1) selectedExceptions.value.push(exception);
  else selectedExceptions.value.splice(index, 1);
}

/** Fetch the list of exceptions and bind the resulting data to the `exceptionsList` reference. */
async function fetchExceptions() {
  exceptionsList.value = (await getData("exceptionsList")) ?? [];
}

/** Add a site to the exceptions list and update the storage key. */
async function addException(site: string) {
  const value: string = site.trim();
  if (!value) return;

  const current: string[] = (await getData("exceptionsList")) ?? [];
  if (current.includes(value)) return; // double-check

  const updated: string[] = [...current, value];
  exceptionsList.value = updated;

  await setData("exceptionsList", updated);
  siteInput.value = "";
}

/** Remove an array of exceptions from storage. */
async function removeExceptions(exceptions: string[]) {
  const current: string[] = (await getData("exceptionsList")) ?? [];

  const updated: string[] = current.filter(
    (e: string) => !exceptions.includes(e),
  );
  exceptionsList.value = updated;

  await setData("exceptionsList", updated);
  selectedExceptions.value = [];
}

onBeforeMount(async () => {
  await fetchExceptions();
});
</script>

<style scoped></style>
