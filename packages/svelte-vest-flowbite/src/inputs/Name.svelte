<script lang="ts" context="module">
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {type Size, type Color} from "./Input.svelte";

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const colorClasses = {
    base: "text-gray-900 dark:text-white",
    green: "text-green-700 dark:text-green-500",
    red: "text-red-700 dark:text-red-500",
  };

  const disabledClass = "opacity-50";

  const baseClass = "font-medium";
  export const getNameClass = (size: Size, color: Color, disabled: boolean) => {
    const sizeClass = sizeClasses[size];
    const colorClass = colorClasses[color];
    return `${baseClass} ${sizeClass} ${colorClass} ${disabled ? disabledClass : ""}`;
  };
</script>

<script lang="ts">
  export let tag: string = "span";
  export let size: Size = "md";
  export let color: Color = "base";
  export let disabled: boolean = false;

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  $: nameClass = twMerge(getNameClass(size, color, disabled), propClass);
</script>

<svelte:element this={tag} {...$$restProps} class={nameClass}>
  <slot />
</svelte:element>
