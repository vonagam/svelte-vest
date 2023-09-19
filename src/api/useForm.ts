import * as Svelte from "svelte";
import {FormApi} from './FormApi.js';

export declare namespace useForm {
  type Options<V = any, A = V> = FormApi.Options<V, A>;
}

export const useForm = <V = any, A = V>(options: useForm.Options<V, A>) => {
  const form = new FormApi(options);
  Svelte.setContext(useForm, form);
  return form;
};

export const useContextForm = <V = any, A = V>(): FormApi<V, A>  => {
  return Svelte.getContext(useForm);
};
