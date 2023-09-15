import * as Store from "svelte/store";
import * as Vest from "vest";
import {vestSelectors} from './utils/vestSelectors.js';
import {lazyPrototype} from './utils/lazyPrototype.js';
import {Access} from "./Access.js";
import {Suite} from "./Suite.js";
import {FormApi} from "./FormApi.js";

export declare namespace FieldApi {
  type Summary = Vest.SuiteSummary<"", string>["tests"] extends {"": infer T} ? T : never;
}

export interface FieldApi<T = any, F extends string = keyof T & string, K extends F = F> {
  getSummary: () => FieldApi.Summary;
  test: () => Suite.RunResult<T, F>;
  getValue: () => Access.Value<T, K>;
  setValue: (value: Access.Value<T, K>) => void;
  updateValue: (updater: Access.Updater<T, K>) => void;
  removeValue: () => void;
  isDisabled: () => void;
  setDisabled: (bool?: boolean) => void;
  isReadonly: () => void;
  setReadonly: (bool?: boolean) => void;
  isLocked: () => void;
  setTouched: (bool?: boolean) => void;
  setBlurred: (bool?: boolean) => void;
  onBlur: () => void;
  onInput: (event: any) => void;
  onChange: (event: any) => void;
  findInput: () => HTMLElement | undefined;
  focusInput: () => void;
  blurInput: () => void;
  isTouched: () => boolean;
  isBlurred: () => boolean;
  isValid: () => boolean;
  isInvalid: () => boolean;
  isTested: () => boolean;
  isUntested: () => boolean;
  isPending: () => boolean;
  isWarned: () => boolean;
  isUncertain: () => boolean;
  isOmitted: () => boolean;
  getError: () => string;
  getErrors: () => string[];
  getWarning: () => string;
  getWarnings: () => string[];
}

export class FieldApi<T = any, F extends string = keyof T & string, K extends F = F> {
  readonly form: FormApi<T, F>;
  readonly field: FieldApi<T, F, K>;
  readonly name: K;

  constructor(form: FormApi<T, F>, name: K) {
    this.form = form;
    this.field = this;
    this.name = name;
  }

  // tests

  get summary() {
    return Store.derived(this.form.summary, (summary) => summary.tests[this.name] as FieldApi.Summary);
  }

  // data

  get value() {
    return partialStore(this.form.values, this.getValue, this.setValue);
  }

  // disabled / readonly

  get disabled() {
    return partialStore(this.form.disabledFields, Has(this.name), this.setDisabled);
  }
  get readonly() {
    return partialStore(this.form.readonlyFields, Has(this.name), this.setReadonly);
  }
  get locked() {
    return Store.derived([this.disabled, this.readonly], ([disabled, readonly]) => disabled || readonly);
  }

  // interactions

  get touched() {
    return partialStore(this.form.touchedFields, Has(this.name), this.setTouched);
  }
  get blurred() {
    return partialStore(this.form.blurredFields, Has(this.name), this.setBlurred);
  }

  // states

  get valid() {
    return Store.derived(this.summary, vestSelectors.valid);
  }
  get invalid() {
    return Store.derived(this.summary, vestSelectors.invalid);
  }
  get tested() {
    return Store.derived(this.summary, vestSelectors.tested);
  }
  get untested() {
    return Store.derived(this.summary, vestSelectors.untested);
  }
  get pending() {
    return Store.derived(this.summary, vestSelectors.pending);
  }
  get warned() {
    return Store.derived(this.summary, vestSelectors.warned);
  }
  get uncertain() {
    return Store.derived(this.summary, vestSelectors.uncertain);
  }
  get omitted() {
    return Store.derived(this.summary, vestSelectors.omitted);
  }

  // messages

  get error() {
    return Store.derived(this.form.summary, (r) => r.getError(this.name) || "");
  }
  get errors() {
    return Store.derived(this.form.summary, (r) => r.getErrors(this.name));
  }
  get warning() {
    return Store.derived(this.form.summary, (r) => r.getWarning(this.name) || "");
  }
  get warnings() {
    return Store.derived(this.form.summary, (r) => r.getWarnings(this.name));
  }
  get message() {
    return Store.derived([this.error, this.warning], ([error, warning]) => error || warning);
  }
  get messages() {
    return Store.derived([this.errors, this.warnings], ([errors, warnings]) => errors.concat(warnings));
  }
}

// laziness

lazyPrototype(FieldApi.prototype);

// SetHas

const Has = <T, V extends T>(value: V) => (set: Set<T>) => set.has(value);

// partialStore

const partialStore = <T, R>(origin: Store.Readable<T>, get: (origin: T) => R, set: (value: R) => void) => {
  const derived = Store.derived(origin, get);
  const {subscribe} = derived;
  const update = (update: (value: R) => R) => set(update(Store.get(derived)));
  const store: Store.Writable<R> = {subscribe, set, update};
  return store;
};
