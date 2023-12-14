import * as Vest from "vest";
import type {Access} from "../api/Access.js";

export declare namespace Test {
  type Enforced = ReturnType<typeof Vest["enforce"]>;
  type Enforce = (message: string) => Enforced;
  type Input<T = any> = {value: T, enforce: Enforce, signal: AbortSignal};
  type Body<T = any> = (input: Input<T>) => void | Promise<void>;
}

export type Test<V = any, A = V> = <F extends Access.Field<A>>(field: F, test: Test.Body<A[F]>) => void;

export const Test = <V, A = V>(values: V, get: Access.Get<V, A>) => {
  const test: Test<V, A> = (field, run) => {
    Vest.test(field, ({signal}) => {
      const value = get(values, field);
      const enforce = (message: string) => Vest.enforce(value).message(message);
      return run({value, enforce, signal});
    });
  };

  return test;
};
