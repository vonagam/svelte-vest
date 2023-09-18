import * as Vest from "vest";
import {Access} from "./Access.js";

export declare namespace Test {
  type Enforced = ReturnType<typeof Vest["enforce"]>;
  type Enforce = (message: string) => Enforced;
  type Body<T = any> = (enforce: Enforce, value: T) => void | Promise<void>;
}

export type Test<V = any, A = V> = <F extends Access.Field<A>>(field: F, test: Test.Body<A[F]>) => void;

export const Test = <V, A = V>(values: V, get: Access.Get<V, A>) => {
  const test: Test<V, A> = (field, run) => {
    Vest.test(field, () => {
      const value = get(values, field);
      const enforce = (message: string) => Vest.enforce(value).message(message);
      return run(enforce, value);
    });
  };

  return test;
};
