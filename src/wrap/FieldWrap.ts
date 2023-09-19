import {Access} from "../api/Access.js";
import {FormApi} from "../api/FormApi.js";
import {FieldApi} from "../api/FieldApi.js";
import {Wrap, wrap} from "./Wrap.js";
import {FormWrap} from "./FormWrap.js";

const storesKeys = [
  "summary",
  "value",
  "touched",
  "visited",
  "locked",
  "valid",
  "invalid",
  "tested",
  "untested",
  "pending",
  "warned",
  "uncertain",
  "omitted",
  "error",
  "errors",
  "warning",
  "warnings",
  "message",
  "messages",
] as const;

type Stored = {readonly [K in Wrap.ArrayElementType<typeof storesKeys>]: Wrap.StoreValueType<FieldApi[K]>};

export interface FieldWrap<V, A, K> extends Stored {}
export interface FieldWrap<V, A, K> extends Omit<FieldApi<V, A, K>, "form" | "field" | keyof Stored> {}
export class FieldWrap<V = any, A = V, K extends Access.Field<A> = Access.Field<A>> extends Wrap {
  readonly formApi: FormApi<V, A>;
  readonly fieldApi: FieldApi<V, A, K>;
  readonly form: FormWrap<V, A>;
  readonly field: FieldWrap<V, A, K>;
  readonly name: K;

  constructor(fieldApi: FieldApi<V, A, K>, unsubscribes: (() => void)[], invalidate: () => void) {
    super(invalidate, unsubscribes);

    this.formApi = fieldApi.form;
    this.fieldApi = fieldApi;
    this.form = new FormWrap(this.formApi, unsubscribes, invalidate);
    this.field = this;
    this.name = fieldApi.name;
  }
}

wrap(FieldApi.prototype, FieldWrap.prototype, (that) => that.fieldApi, storesKeys);
