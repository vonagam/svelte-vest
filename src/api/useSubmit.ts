import {onMount} from "svelte";
import * as Store from "svelte/store";
import type {FormApi} from "./FormApi.js";

export declare namespace useSubmit {
  type Options = {
    timeout?: number,
  };

  type State = {status?: undefined} | {status: "pending"} | {status: "done", result: any};
}

export const useSubmit = (form: FormApi, options?: useSubmit.Options) => {
  let timeout: number | undefined = undefined;
  const status = Store.writable<useSubmit.State>({});

  const onSubmit = async () => {
    if (form.isLocked() || form.isOmitted() || timeout !== undefined) return;
    timeout = -1;

    status.set({status: "pending"});
    const result = await form.submit();
    status.set({status: "done", result});

    timeout = setTimeout(() => {
      timeout = undefined;
      status.set({});
    }, options?.timeout ?? 1_500);
  };

  onMount(() => () => {
    clearTimeout(timeout);
  });

  return {
    subscribe: status.subscribe,
    handle: onSubmit,
  };
};
