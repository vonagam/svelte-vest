<script lang="ts" context="module">
  import {getContext} from "svelte";
  import {twMerge, type ClassNameValue} from "tailwind-merge";

  export type Size = "sm" | "md" | "lg";
  export type Color = "base" | "green" | "red";

  const sizeClasses = {
    sm: "p-2 text-xs",
    md: "p-2.5 text-sm",
    lg: "p-3 text-base",
  };

  const colorClasses = {
    base: "bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
    tinted: "bg-gray-50 text-gray-900 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400",
  };

  const borderClasses = {
    base: "border-gray-300 dark:border-gray-600",
    tinted: "border-gray-300 dark:border-gray-500",
    green: "border-green-500 dark:border-green-500",
    red: "border-red-500 dark:border-red-500",
  };
  export const getBorderClass = (color: Color, background: boolean) => {
    return borderClasses[color === "base" && background ? "tinted" : color];
  };

  const focusClasses = {
    base: "focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500",
    green: "focus:border-green-500 focus:ring-green-500 dark:focus:border-green-500 dark:focus:ring-green-500",
    red: "focus:border-red-500 focus:ring-red-500 dark:focus:border-red-500 dark:focus:ring-red-500",
  };
  export const getFocusClass = (color: Color) => {
    return focusClasses[color];
  };

  export const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

  const baseClass = `block w-full border rounded-lg ${disabledClass}`;
  export const getInputClass = (size: Size, color: Color, background: boolean) => {
    const sizeClass = sizeClasses[size];
    const colorClass = colorClasses[background ? "tinted" : "base"];
    const borderClass = getBorderClass(color, background);
    const ringClass = getFocusClass(color);
    return `${baseClass} ${sizeClass} ${colorClass} ${borderClass} ${ringClass}`;
  };
</script>

<script lang="ts">
  export let type: string = "text";
  export let value: string | undefined = undefined;
  export let size: Size = "md";
  export let color: Color = "base";

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  const background = getContext<boolean>("background");

  $: inputClass = twMerge(getInputClass(size, color, background), propClass);
</script>

<input
  {...$$restProps}
  class={inputClass}
  {...{type}}
  bind:value
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
