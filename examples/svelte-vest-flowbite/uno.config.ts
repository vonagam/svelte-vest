import type {UserConfig} from "@unocss/core";
import {presetIcons} from "@unocss/preset-icons";
import {presetUno} from "@unocss/preset-uno";
import {presetFlowbite} from "@vonagam/unocss-preset-flowbite";

const defineConfig = (config: UserConfig) => config;

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        /\.js($|\?)/,
      ],
    },
  },
  presets: [
    presetUno(),
    presetIcons(),
    presetFlowbite(),
  ],
});
