import type * as Store from "svelte/store";

export declare namespace Wrap {
  type ArrayElementType<T> = T extends readonly (infer E)[] ? E : never;
  type StoreValueType<T> = T extends Store.Readable<infer E> ? E : never;
}

export class Wrap {
  readonly _invalidate: () => void;
  readonly _unsubscribes: (() => void)[];
  readonly _unsubscribe: () => void;

  constructor(invalidate: () => void, unsubscribes: (() => void)[]) {
    this._invalidate = invalidate;
    this._unsubscribes = unsubscribes;
    this._unsubscribe = () => {for (const unsubscribe of unsubscribes) unsubscribe()};
  }
}

export const wrap = <T>(from: object, to: T, getApi: (that: T) => any, storesKeys: Iterable<keyof T>) => {
  const storesKeysSet = new Set(storesKeys);

  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(from))) {
    if (!descriptor.get) continue;

    if (storesKeysSet.has(name as keyof T)) {
      Object.defineProperty(to, name, {configurable: true, get() {
        Object.defineProperty(this, name, {configurable: true, writable: true, value: undefined});

        const api = getApi(this);
        const store: Store.Readable<any> = api[name];

        const wrap: Wrap = this;
        const unsubscribes = wrap._unsubscribes;
        const invalidate = wrap._invalidate;

        unsubscribes.push(store.subscribe((value) => {
          this[name] = value;
          invalidate();
        }));

        return this[name];
      }});
    } else {
      Object.defineProperty(to, name, {configurable: true, get() {
        const api = getApi(this);
        const got = api[name];
        Object.defineProperty(this, name, {configurable: true, value: got});
        return got;
      }});
    }
  }
};
