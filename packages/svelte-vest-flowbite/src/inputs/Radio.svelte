<script lang="ts" context="module">
  import {getContext} from "svelte";
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {type Color} from "./Input.svelte";
  import {getInputClass} from "./Checkbox.svelte";
</script>

<script lang="ts">
  export let group: string | number = "";
  export let value: string | number = "";
  export let custom: boolean = false;
  export let color: Color = "base";

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  const background = getContext<boolean>("background");

  $: inputClass = twMerge(getInputClass(false, color, background, custom), propClass);
</script>

<input
  {...$$restProps}
  class={inputClass}
  type="radio"
  {value}
  bind:group
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
