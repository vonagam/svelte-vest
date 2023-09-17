import * as Store from "svelte/store";
import {vestSelectors} from './utils/vestSelectors.js';
import {lazyPrototype} from './utils/lazyPrototype.js';
import {Access} from "./Access.js";
import {Suite} from "./Suite.js";
import {FieldApi} from "./FieldApi.js";

export declare namespace FormApi {
  type Options<V = any, A = V> = {
    suite: Suite.Body<V, A>,
    values?: V,
    access?: Access<V, A>,
    input?: ((field: Access.Field<A>) => HTMLElement | null | undefined) | string,
  };
}

export class FormApi<V = any, A = V> {
  readonly form: FormApi<V, A>;

  private suite!: Suite<V, A>;
  private input!: (field: Access.Field<A>) => HTMLElement | null | undefined;
  private get!: Access.Get<V, A>;
  private set!: Access.Set<V, A>;
  private remove!: Access.Remove<V, A>;
  private update!: Access.Update<V, A>;
  private fields?: {[F in Access.Field<A>]: FieldApi<V, A, F>};
  private resultStore: ValueStore<Suite.Result<V, A>>;
  private valuesStore: ValueStore<V>;
  private locksStore: LocksStore;
  private submitStore: ValueStore<boolean>;

  // setup

  constructor(options: FormApi.Options<V, A>) {
    this.form = this;
    this.resultStore = makeValueStore<Suite.Result<V, A>>();
    this.valuesStore = makeValueStore<V>();
    this.locksStore = makeValueStore();
    this.submitStore = makeValueStore();
    this.resetApi(options);
  }

  resetApi(options: FormApi.Options<V, A>) {
    const {get, set, remove, update} = options.access || Access as any as Access<V, A>;
    this.get = get;
    this.set = set;
    this.remove = remove;
    this.update = update || (((values, field, updater) => set(values, field, updater(get(values, field)))));

    this.suite?.reset();
    this.suite = Suite(options.suite, get);

    const input = options.input || (() => undefined);
    this.input = typeof input === 'string'
      ? ((field) => document.querySelector<HTMLElement>(input.replace(/\{\}/g, field)))
      : input;

    this.resultStore.set(this.suite.get());
    this.valuesStore.set(options.values || {} as V);
    this.locksStore.set(new Map());
    this.submitStore.set(false);
  }

  // summary

  getSummary() {
    return this.resultStore.value;
  }

  get summary() {
    return Store.readonly(this.resultStore);
  }

  getFieldSummary(field: Access.Field<A>) {
    return this.resultStore.value.tests[field];
  }

  // tests

  test(only?: Access.Field<A> | Access.Field<A>[]) {
    const result = this.suite(this.valuesStore.value, only);
    let sync = false;

    result.done((result) => {
      sync = true;
      this.resultStore.set(result);
    });

    if (!sync) {
      this.resultStore.set(result);
    }

    return result;
  }

  testField(field: Access.Field<A>) {
    return this.test(field);
  }

  // form values

  setValues(values: V) {
    this.valuesStore.set(values);
  }

  updateValues(updater: (values: V) => V) {
    this.valuesStore.update(updater);
  }

  getValues() {
    return this.valuesStore.value;
  }

  get values() {
    return Store.readonly(this.valuesStore);
  }

  setFieldValue<F extends Access.Field<A>>(field: F, value: A[F]) {
    this.valuesStore.set(this.set(this.valuesStore.value, field, value));
  }

  updateFieldValue<F extends Access.Field<A>>(field: F, updater: Access.Updater<V, A, F>) {
    this.valuesStore.set(this.update(this.valuesStore.value, field, updater as any));
  }

  removeFieldValue(field: Access.Field<A>) {
    this.valuesStore.set(this.remove(this.valuesStore.value, field));
  }

  getFieldValue(field: Access.Field<A>) {
    return this.get(this.valuesStore.value, field);
  }

  // locks

  lock() {
    return doLockStore(this.locksStore, undefined);
  }

  isLocked() {
    return this.locksStore.value.has(undefined);
  }

  get locked() {
    return Store.derived(this.locksStore, (locks) => locks.has(undefined));
  }

  lockField(field: Access.Field<A>) {
    return doLockStore(this.locksStore, String(field));
  }

  isFieldLocked(field: Access.Field<A>) {
    return this.isLocked() || this.locksStore.value.has(String(field));
  }

  get lockedFields() {
    return Store.derived(this.locksStore, (locks) => {
      const fields = new Set<Access.Field<A>>(locks.keys());
      fields.delete(undefined as any);
      return fields;
    });
  }

  // submitting

  async submit<T>(action: (result: Suite.Result<V, A>) => T | Promise<T>): Promise<T | undefined> {
    if (this.submitStore.value) return;

    const unlock = this.lock();
    this.submitStore.set(true);
    const result = await new Promise<Suite.Result<V, A>>((resolve) => this.test().done(resolve));

    try {
      return await action(result);
    } finally {
      unlock();
      this.submitStore.set(false);
    }
  }

  isSubmitting() {
    return this.submitStore.value;
  }

  get submitting() {
    return Store.readonly(this.submitStore);
  }

  // field events

  onFieldInput(field: Access.Field<A>, event: any) {
    if (this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    if (this.isFieldTested(field) && next !== prev) this.testField(field);
  }

  onFieldChange(field: Access.Field<A>, event: any) {
    if (this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    if (!this.isFieldTested(field) || next !== prev) this.testField(field);
  }

  // field input

  findFieldInput(field: Access.Field<A>) {
    return this.input(field) || undefined;
  }

  focusFieldInput(field: Access.Field<A>) {
    this.input(field)?.focus();
  }

  blurFieldInput(field: Access.Field<A>) {
    this.input(field)?.blur();
  }

  // result states

  isValid() {
    return vestSelectors.valid(this.resultStore.value);
  }
  isInvalid() {
    return vestSelectors.invalid(this.resultStore.value);
  }
  isTested() {
    return vestSelectors.tested(this.resultStore.value);
  }
  isUntested() {
    return vestSelectors.untested(this.resultStore.value);
  }
  isWarned() {
    return vestSelectors.warned(this.resultStore.value);
  }
  isUncertain() {
    return vestSelectors.uncertain(this.resultStore.value);
  }
  isPending() {
    return vestSelectors.pending(this.resultStore.value);
  }
  get valid() {
    return Store.derived(this.resultStore, vestSelectors.valid);
  }
  get invalid() {
    return Store.derived(this.resultStore, vestSelectors.invalid);
  }
  get tested() {
    return Store.derived(this.resultStore, vestSelectors.tested);
  }
  get untested() {
    return Store.derived(this.resultStore, vestSelectors.untested);
  }
  get pending() {
    return Store.derived(this.resultStore, vestSelectors.pending);
  }
  get warned() {
    return Store.derived(this.resultStore, vestSelectors.warned);
  }
  get uncertain() {
    return Store.derived(this.resultStore, vestSelectors.uncertain);
  }
  isFieldValid(field: Access.Field<A>) {
    return vestSelectors.valid(this.resultStore.value.tests[field]);
  }
  isFieldInvalid(field: Access.Field<A>) {
    return vestSelectors.invalid(this.resultStore.value.tests[field]);
  }
  isFieldTested(field: Access.Field<A>) {
    return vestSelectors.tested(this.resultStore.value.tests[field]);
  }
  isFieldUntested(field: Access.Field<A>) {
    return vestSelectors.untested(this.resultStore.value.tests[field]);
  }
  isFieldPending(field: Access.Field<A>) {
    return vestSelectors.pending(this.resultStore.value.tests[field]);
  }
  isFieldWarned(field: Access.Field<A>) {
    return vestSelectors.warned(this.resultStore.value.tests[field]);
  }
  isFieldUncertain(field: Access.Field<A>) {
    return vestSelectors.uncertain(this.resultStore.value.tests[field]);
  }
  isFieldOmitted(field: Access.Field<A>) {
    return vestSelectors.omitted(this.resultStore.value.tests[field]);
  }

  // result messages

  getError(): Suite.Failure<V, A> | undefined {
    return this.resultStore.value.getError() as any;
  }
  getErrors() {
    return this.resultStore.value.getErrors();
  }
  getWarning(): Suite.Failure<V, A> | undefined {
    return this.resultStore.value.getWarning() as any;
  }
  getWarnings() {
    return this.resultStore.value.getWarnings();
  }
  get error(): Store.Readable<Suite.Failure<V, A> | undefined> {
    return Store.derived(this.resultStore, (r) => r.getError() as any);
  }
  get errors() {
    return Store.derived(this.resultStore, (r) => r.getErrors());
  }
  get warning(): Store.Readable<Suite.Failure<V, A> | undefined> {
    return Store.derived(this.resultStore, (r) => r.getWarning() as any);
  }
  get warnings() {
    return Store.derived(this.resultStore, (r) => r.getWarnings());
  }
  getFieldError(field: Access.Field<A>) {
    return this.resultStore.value.getError(field) || "";
  }
  getFieldErrors(field: Access.Field<A>) {
    return this.resultStore.value.getErrors(field);
  }
  getFieldWarning(field: Access.Field<A>) {
    return this.resultStore.value.getWarning(field) || "";
  }
  getFieldWarnings(field: Access.Field<A>) {
    return this.resultStore.value.getWarnings(field);
  }

  // field api

  field<F extends Access.Field<A>>(field: F): FieldApi<V, A, F> {
    return (this.fields ||= Object.create(null))[field] ||= new FieldApi(this, field);
  }
}

// laziness

lazyPrototype(FormApi.prototype);

// FieldApi partials

const partialRegexp = /Field(?=$|[A-Z])/;
for (const name of Object.getOwnPropertyNames(FormApi.prototype)) {
  const partial = name.replace(partialRegexp, "");
  if (partial === name) continue;
  Object.defineProperty(FieldApi.prototype, partial, {configurable: true, get() {
    const bind = this.form[name].bind(this.form, this.name);
    Object.defineProperty(this.field, partial, {configurable: true, value: bind});
    return bind;
  }});
}

// ValueStore

type ValueStore<T> = Store.Writable<T> & {value: T};

const makeValueStore = <T>(value?: T) => {
  const {subscribe, set: doSet} = Store.writable(value);

  const set = (value: T) => {
    if (value === store.value) return;
    store.value = value;
    doSet(value);
  };

  const update = (updater: (value: T) => T) => {
    const value = updater(store.value);
    if (value === store.value) return;
    store.value = value;
    doSet(value);
  };

  const store = {value, set, update, subscribe} as ValueStore<T>;

  return store;
};

// LocksStore

type LocksStore = ValueStore<Map<any, Set<() => void>>>;

const doLockStore = (store: LocksStore, key: any) => {
  const map = new Map(store.value);
  const set = new Set(map.get(key));

  const unlock = () => {
    if (!store.value.get(key)?.has(unlock)) return;
    const map = new Map(store.value);
    const set = new Set(map.get(key));
    set.delete(unlock);
    set.size === 0 ? map.delete(key): map.set(key, set);
    store.set(map);
  };

  set.add(unlock);
  map.set(key, set);
  store.set(map);

  return unlock;
};
