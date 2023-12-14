<script lang="ts" context="module">
  import {getContext} from "svelte";
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {disabledClass, getBorderClass, getFocusClass, type Color} from "./Input.svelte";

  const colorClasses = {
    base: "text-primary-600",
    red: "text-red-600",
    green: "text-green-600",
  };

  const backgroundClasses = {
    base: "bg-gray-50 dark:bg-gray-700",
    tinted: "bg-gray-50 dark:bg-gray-600",
  };

  const baseClass = `w-4 h-4 dark:ring-offset-gray-800 focus:ring-2 ${disabledClass}`;
  export const getInputClass = (rounded: boolean, color: Color, background: boolean, custom: boolean) => {
    const radiusClass = rounded ? "rounded" : "";
    const colorClass = colorClasses[color];
    const borderClass = getBorderClass(color, background);
    const focusClass = getFocusClass(color);
    const backgroundClass = backgroundClasses[background  ? "tinted" : "base"];
    const customClass = custom ? "sr-only peer" : "";
    return `${baseClass} ${radiusClass} ${colorClass} ${borderClass} ${focusClass} ${backgroundClass} ${customClass}`;
  };
</script>

<script lang="ts">
  export let group: (string | number)[] = [];
  export let value: string | number = "on";
  export let checked: boolean | undefined = undefined;
  export let color: Color = "base";
  export let custom: boolean = false;

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  const background = getContext<boolean>("background");

  $: inputClass = twMerge(getInputClass(true, color, background, custom), propClass);

  const updateGroup = (checked: boolean | undefined) => {
    if (group.includes(value)) {
      if (checked === false) {
        group = group.filter(_ => _ !== value);
      }
    } else {
      if (checked === true) {
        group = group.concat([value]);
      }
    }
  };

  const updateChecked = (group: (string | number)[]) => {
    checked = group.includes(value);
  };

  $: updateGroup(checked);
  $: updateChecked(group);
</script>

<input
  {...$$restProps}
  class={inputClass}
  type="checkbox"
  {value}
  bind:checked
  on:blur
  on:change
  on:click
  on:contextmenu
  on:focus
  on:input
  on:keydown
  on:keypress
  on:keyup
  on:mouseenter
  on:mouseleave
  on:mouseover
  on:paste
/>
