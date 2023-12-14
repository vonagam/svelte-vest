<script lang="ts" context="module">
  import {getContext} from "svelte";
  import {twMerge, type ClassNameValue} from "tailwind-merge";
  import {getInputClass, type Size, type Color} from "./Input.svelte";
</script>

<script lang="ts">
  export let items: {value: any, name: any}[] = [];
  export let placeholder: string | undefined = undefined;
  export let value: string | undefined = undefined;
  export let size: Size = "md";
  export let color: Color = "base";

  let propClass: ClassNameValue = undefined;
  export {propClass as class};

  const background = getContext<boolean>("background");

  $: inputClass = twMerge(getInputClass(size, color, background), propClass);
</script>

<select
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
>
  {#if placeholder}
    <option disabled selected value="">{placeholder}</option>
  {/if}

  {#each items as {value, name}}
    <option {value}>{name}</option>
  {:else}
    <slot />
  {/each}
</select>
