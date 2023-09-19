import {FormApi} from "../api/FormApi.js";
import {Wrap, wrap} from "./Wrap.js";

const storesKeys = [
  "summary",
  "values",
  "locked",
  "lockedFields",
  "submitting",
  "submitted",
  "touched",
  "touchedFields",
  "visited",
  "visitedFields",
  "valid",
  "invalid",
  "tested",
  "untested",
  "pending",
  "warned",
  "uncertain",
  "error",
  "errors",
  "warning",
  "warnings",
] as const;

type Stored = {readonly [K in Wrap.ArrayElementType<typeof storesKeys>]: Wrap.StoreValueType<FormApi[K]>};

export interface FormWrap<V, A> extends Stored {}
export interface FormWrap<V, A> extends Omit<FormApi<V, A>, "form" | keyof Stored> {}
export class FormWrap<V = any, A = V> extends Wrap {
  readonly formApi: FormApi<V, A>;
  readonly form: FormWrap<V, A>;

  constructor(formApi: FormApi<V, A>, unsubscribes: (() => void)[], invalidate: () => void) {
    super(invalidate, unsubscribes);

    this.formApi = formApi;
    this.form = this;
  }
}

wrap(FormApi.prototype, FormWrap.prototype, (that) => that.formApi, storesKeys);
