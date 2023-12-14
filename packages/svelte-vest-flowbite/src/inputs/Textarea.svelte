<script lang="ts" context="module">
  import {getContext} from "svelte";
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {getInputClass, type Size, type Color} from "./Input.svelte";
</script>

<script lang="ts">
  export let value: string | undefined = undefined;
  export let size: Size = "md";
  export let color: Color = "base";

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  const background = getContext<boolean>("background");

  $: inputClass = twMerge(getInputClass(size, color, background), propClass);
</script>

<textarea
  {...$$restProps}
  class={inputClass}
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
