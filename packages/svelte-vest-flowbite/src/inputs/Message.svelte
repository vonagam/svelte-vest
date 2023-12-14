<script lang="ts" context="module">
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {type Size, type Color} from "./Input.svelte";

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const colorClasses = {
    base: "text-gray-500 dark:text-gray-400",
    green: "text-green-600 dark:text-green-500",
    red: "text-red-600 dark:text-red-500",
  };

  const disabledClass = "opacity-50";

  export const getMessageClass = (size: Size, color: Color, disabled: boolean) => {
    const sizeClass = sizeClasses[size];
    const colorClass = colorClasses[color];
    return `${sizeClass} ${colorClass} ${disabled ? disabledClass : ""}`;
  };
</script>

<script lang="ts">
  export let tag: string = "p";
  export let size: Size = "md";
  export let color: Color = "base";
  export let disabled: boolean = false;

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  $: messageClass = twMerge(getMessageClass(size, color, disabled), propClass);
</script>

<svelte:element this={tag} {...$$restProps} class={messageClass}>
  <slot />
</svelte:element>
