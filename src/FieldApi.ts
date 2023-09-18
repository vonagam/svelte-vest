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

export interface FieldApi<V = any, A = V, F extends Access.Field<A> = Access.Field<A>> {
  getSummary: () => FieldApi.Summary;
  test: () => Suite.RunSummary<V, A>;
  setValue: (value: A[F]) => void;
  updateValue: (updater: Access.Updater<V, A, F>) => void;
  removeValue: () => void;
  getValue: () => A[F];
  lock: () => () => void;
  isLocked: () => boolean;
  setTouched: (bool?: boolean) => void;
  isTouched: () => boolean;
  setVisited: (bool?: boolean) => void;
  isVisited: () => boolean;
  onInput: (event: any) => void;
  onChange: (event: any) => void;
  onBlur: (event: any) => void;
  findInput: () => HTMLElement | undefined;
  focusInput: () => void;
  blurInput: () => void;
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

export class FieldApi<V = any, A = V, F extends Access.Field<A> = Access.Field<A>> {
  readonly form: FormApi<V, A>;
  readonly field: FieldApi<V, A, F>;
  readonly name: F;

  constructor(form: FormApi<V, A>, name: F) {
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

  // locks

  get locked() {
    const {form: {locked, lockedFields}, name} = this;
    return Store.derived([locked, lockedFields], ([locked, lockedFields]) => locked || lockedFields.has(name));
  }

  // touched / visited

  get touched() {
    return partialStore(this.form.touchedFields, Has(this.name), this.setTouched);
  }
  get visited() {
    return partialStore(this.form.visitedFields, Has(this.name), this.setVisited);
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
    return Store.derived(this.form.summary, (s) => s.getError(this.name) || "");
  }
  get errors() {
    return Store.derived(this.form.summary, (s) => s.getErrors(this.name));
  }
  get warning() {
    return Store.derived(this.form.summary, (s) => s.getWarning(this.name) || "");
  }
  get warnings() {
    return Store.derived(this.form.summary, (s) => s.getWarnings(this.name));
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

// Has

const Has = <T, V extends T>(value: V) => (set: Set<T>) => set.has(value);

// partialStore

const partialStore = <T, R>(origin: Store.Readable<T>, get: (origin: T) => R, set: (value: R) => void) => {
  const derived = Store.derived(origin, get);
  const {subscribe} = derived;
  const update = (update: (value: R) => R) => set(update(Store.get(derived)));
  const store: Store.Writable<R> = {subscribe, set, update};
  return store;
};
