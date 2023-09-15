// import * as Svelte from "svelte";
// import {Data} from "./utils/types.js";
// import {FormApi} from './FormApi.js';

// export declare namespace useForm {
//   type Options<T> = FormApi.Options<T>;
// }

// export const useForm = <T extends Data>(options: useForm.Options<T>) => {
//   const form = new FormApi(options);
//   Svelte.setContext(useForm, form);
//   return form;
// };

// export const useContextForm = <T extends Data = Data>(): FormApi<T>  => {
//   return Svelte.getContext(useForm);
// };
