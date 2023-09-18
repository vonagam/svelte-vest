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
  private summaryStore: ValueStore<Suite.Summary<V, A>>;
  private valuesStore: ValueStore<V>;
  private locksStore?: LocksStore;
  private submitStore?: ValueStore<boolean>;
  private submittedStore?: ValueStore<boolean>;
  private touchedStore?: SetStore<Access.Field<A>>;
  private visitedStore?: SetStore<Access.Field<A>>;

  // setup

  constructor(options: FormApi.Options<V, A>) {
    this.form = this;
    this.summaryStore = makeValueStore<Suite.Summary<V, A>>();
    this.valuesStore = makeValueStore<V>();
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

    this.summaryStore.set(this.suite.get());
    this.valuesStore.set(options.values || {} as V);

    this.locksStore?.set(new Map());
    this.submitStore?.set(false);
    this.submittedStore?.set(false);
    this.touchedStore?.set(new Set());
    this.visitedStore?.set(new Set());
  }

  // summary

  getSummary() {
    return this.summaryStore.value;
  }

  get summary() {
    return Store.readonly(this.summaryStore);
  }

  getFieldSummary(field: Access.Field<A>) {
    return this.summaryStore.value.tests[field];
  }

  // tests

  test(only?: Access.Field<A> | Access.Field<A>[]) {
    const result = this.suite(this.valuesStore.value, only);
    let sync = false;

    result.done((result) => {
      sync = true;
      this.summaryStore.set(result);
    });

    if (!sync) {
      this.summaryStore.set(result);
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
    return useLocksStore(this.locksStore ||= makeLocksStore(), undefined);
  }

  isLocked() {
    return !!this.locksStore?.value.has(undefined);
  }

  get locked() {
    return Store.derived(this.locksStore ||= makeLocksStore(), (locks) => locks.has(undefined));
  }

  lockField(field: Access.Field<A>) {
    return useLocksStore(this.locksStore ||= makeLocksStore(), String(field));
  }

  isFieldLocked(field: Access.Field<A>) {
    return this.isLocked() || !!this.locksStore?.value.has(String(field));
  }

  get lockedFields() {
    return Store.derived(this.locksStore ||= makeLocksStore(), (locks) => {
      const fields = new Set<Access.Field<A>>(locks.keys());
      fields.delete(undefined as any);
      return fields;
    });
  }

  // submitting

  async submit<T>(action: (summary: Suite.Summary<V, A>) => T | Promise<T>): Promise<T | undefined> {
    if (this.submitStore?.value) return;
    this.submitStore ||= makeValueStore(false);
    this.submittedStore ||= makeValueStore(false);

    const unlock = this.lock();
    this.submitStore.set(true);
    this.submittedStore.set(true);

    try {
      const summary = await new Promise<Suite.Summary<V, A>>((resolve) => this.test().done(resolve));
      return await action(summary);
    } finally {
      unlock();
      this.submitStore.set(false);
    }
  }

  isSubmitting() {
    return !!this.submitStore?.value;
  }
  get submitting() {
    return Store.readonly(this.submitStore ||= makeValueStore(false));
  }

  isSubmitted() {
    return !!this.submittedStore?.value;
  }
  get submitted() {
    return Store.readonly(this.submittedStore ||= makeValueStore(false));
  }

  // touched / visited

  isTouched() {
    return !!this.touchedStore?.value.size;
  }
  get touched() {
    return Store.derived(this.touchedFields, (set) => set.size > 0);
  }
  setFieldTouched(field: Access.Field<A>, bool?: boolean) {
    toggleSetStore(this.touchedStore ||= makeSetStore(), field, bool ?? true);
  }
  isFieldTouched(field: Access.Field<A>) {
    return !!this.touchedStore?.value.has(field);
  }
  get touchedFields(): Store.Writable<Set<Access.Field<A>>> {
    return this.touchedStore ||= makeSetStore();
  }

  isVisited() {
    return !!this.visitedStore?.value.size;
  }
  get visited() {
    return Store.derived(this.visitedFields, (set) => set.size > 0);
  }
  setFieldVisited(field: Access.Field<A>, bool?: boolean) {
    toggleSetStore(this.visitedStore ||= makeSetStore(), field, bool ?? true);
  }
  isFieldVisited(field: Access.Field<A>) {
    return !!this.visitedStore?.value.has(field);
  }
  get visitedFields(): Store.Writable<Set<Access.Field<A>>> {
    return this.visitedStore ||= makeSetStore();
  }

  // field events

  onFieldInput(field: Access.Field<A>, event: any) {
    if (this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    if (this.isFieldTested(field) && next !== prev) this.testField(field);
  }

  onFieldChange(field: Access.Field<A>, event: any) {
    if (this.isFieldLocked(field)) return;
    const prev = this.valuesStore.value;
    this.setFieldValue(field, event.target.value);
    const next = this.valuesStore.value;
    this.setFieldTouched(field, true);
    this.setFieldVisited(field, true);
    if (!this.isFieldTested(field) || next !== prev) this.testField(field);
  }

  onFieldBlur(field: Access.Field<A>, event: any) {
    if (this.isFieldLocked(field)) return;
    this.setFieldVisited(field, true);
    if (!this.isFieldTested(field) && this.isFieldTouched(field)) this.testField(field);
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

  // summary states

  isValid() {
    return vestSelectors.valid(this.summaryStore.value);
  }
  isInvalid() {
    return vestSelectors.invalid(this.summaryStore.value);
  }
  isTested() {
    return vestSelectors.tested(this.summaryStore.value);
  }
  isUntested() {
    return vestSelectors.untested(this.summaryStore.value);
  }
  isWarned() {
    return vestSelectors.warned(this.summaryStore.value);
  }
  isUncertain() {
    return vestSelectors.uncertain(this.summaryStore.value);
  }
  isPending() {
    return vestSelectors.pending(this.summaryStore.value);
  }
  get valid() {
    return Store.derived(this.summaryStore, vestSelectors.valid);
  }
  get invalid() {
    return Store.derived(this.summaryStore, vestSelectors.invalid);
  }
  get tested() {
    return Store.derived(this.summaryStore, vestSelectors.tested);
  }
  get untested() {
    return Store.derived(this.summaryStore, vestSelectors.untested);
  }
  get pending() {
    return Store.derived(this.summaryStore, vestSelectors.pending);
  }
  get warned() {
    return Store.derived(this.summaryStore, vestSelectors.warned);
  }
  get uncertain() {
    return Store.derived(this.summaryStore, vestSelectors.uncertain);
  }
  isFieldValid(field: Access.Field<A>) {
    return vestSelectors.valid(this.summaryStore.value.tests[field]);
  }
  isFieldInvalid(field: Access.Field<A>) {
    return vestSelectors.invalid(this.summaryStore.value.tests[field]);
  }
  isFieldTested(field: Access.Field<A>) {
    return vestSelectors.tested(this.summaryStore.value.tests[field]);
  }
  isFieldUntested(field: Access.Field<A>) {
    return vestSelectors.untested(this.summaryStore.value.tests[field]);
  }
  isFieldPending(field: Access.Field<A>) {
    return vestSelectors.pending(this.summaryStore.value.tests[field]);
  }
  isFieldWarned(field: Access.Field<A>) {
    return vestSelectors.warned(this.summaryStore.value.tests[field]);
  }
  isFieldUncertain(field: Access.Field<A>) {
    return vestSelectors.uncertain(this.summaryStore.value.tests[field]);
  }
  isFieldOmitted(field: Access.Field<A>) {
    return vestSelectors.omitted(this.summaryStore.value.tests[field]);
  }

  // summary messages

  getError(): Suite.Failure<V, A> | undefined {
    return this.summaryStore.value.getError() as any;
  }
  getErrors() {
    return this.summaryStore.value.getErrors();
  }
  getWarning(): Suite.Failure<V, A> | undefined {
    return this.summaryStore.value.getWarning() as any;
  }
  getWarnings() {
    return this.summaryStore.value.getWarnings();
  }
  get error(): Store.Readable<Suite.Failure<V, A> | undefined> {
    return Store.derived(this.summaryStore, (s) => s.getError() as any);
  }
  get errors() {
    return Store.derived(this.summaryStore, (s) => s.getErrors());
  }
  get warning(): Store.Readable<Suite.Failure<V, A> | undefined> {
    return Store.derived(this.summaryStore, (s) => s.getWarning() as any);
  }
  get warnings() {
    return Store.derived(this.summaryStore, (s) => s.getWarnings());
  }
  getFieldError(field: Access.Field<A>) {
    return this.summaryStore.value.getError(field) || "";
  }
  getFieldErrors(field: Access.Field<A>) {
    return this.summaryStore.value.getErrors(field);
  }
  getFieldWarning(field: Access.Field<A>) {
    return this.summaryStore.value.getWarning(field) || "";
  }
  getFieldWarnings(field: Access.Field<A>) {
    return this.summaryStore.value.getWarnings(field);
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

// SetStore

type SetStore<T> = ValueStore<Set<T>>;

const makeSetStore = <T>() => {
  return makeValueStore(new Set<T>());
};

const toggleSetStore = <T>(store: SetStore<T>, item: T, next: boolean) => {
  store.update((set) => {
    const prev = set.has(item);
    if (next === prev) return set;
    set = new Set(set);
    next ? set.add(item) : set.delete(item);
    return set;
  });
};

// LocksStore

type LocksStore = ValueStore<Map<any, Set<() => void>>>;

const makeLocksStore = (): LocksStore => {
  return makeValueStore(new Map());
};

const useLocksStore = (store: LocksStore, key: any) => {
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
