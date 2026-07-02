<template>
  <section>
    <div class="flex flex-col gap-2">
      <label class="px-4 font-bold">{{ props.label }}</label>

      <div
        class="grid grid-cols-1 lg:grid-cols-[6fr_1fr_1fr] items-start gap-2"
      >
        <div class="flex flex-col gap-2">
          <input
            v-if="type !== 'select'"
            class="px-4 py-4 lg:py-2 text-sm outline-none rounded-lg bg-zinc-800"
            :type="type"
            :step="step"
            :min="min"
            :max="max"
            :placeholder="placeholder"
            @keyup.enter="save"
            v-model="localValue"
          />
          <select
            v-else
            class="px-4 py-4 lg:py-2 text-sm outline-none rounded-lg bg-zinc-800"
            v-model="localValue"
          >
            <option
              v-for="option in options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <span class="px-4 text-xs text-zinc-500" v-html="description" />
        </div>

        <button
          class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
          :disabled="!isValid"
          @click="save"
        >
          Save
        </button>

        <button
          class="cursor-pointer px-4 py-4 lg:py-2 text-sm whitespace-nowrap rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:select-none disabled:cursor-not-allowed disabled:hover:bg-zinc-700 disabled:brightness-50"
          @click="reset"
        >
          Default
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { setData, getData } from "@/utils/storage";

/** An input field must be either a number input, string input, or selection input. */
type FieldType = "number" | "text" | "select";

/**
 * The schema for a single option in a selection input.
 * Must have a text label and a corresponding value.
 */
interface SelectOption {
  label: string;
  value: string | number;
}

const props = withDefaults(
  defineProps<{
    storageKey: string;
    label: string;
    description?: string;
    type?: FieldType;
    defaultValue: string | number;
    step?: number;
    min?: number;
    max?: number;
    placeholder?: string;
    options?: SelectOption[];
    validate?: (v: string | number) => boolean;
  }>(),
  { type: "number", description: "" },
);

const emit = defineEmits<{ saved: [value: string | number] }>();

const localValue = ref<string | number>();

/** Check if the inputted value meets the constraints set by the provided validation function. */
const isValid = computed(() => {
  if (localValue.value === undefined || localValue.value === "") return false;
  return props.validate ? props.validate(localValue.value) : true;
});

/** Save the input data to the browser storage. */
async function save() {
  if (!isValid.value) return;
  await setData(props.storageKey, localValue.value);
  emit("saved", localValue.value!);
}

/** Reset the currently stored data to the provided default. */
async function reset() {
  localValue.value = props.defaultValue;
  await setData(props.storageKey, props.defaultValue);
  emit("saved", props.defaultValue);
}

onBeforeMount(async () => {
  let current: any = await getData(props.storageKey);

  if (current === undefined || current === null) {
    current = props.defaultValue;
    await setData(props.storageKey, current);
  }

  localValue.value = current;
});
</script>

<style scoped></style>
