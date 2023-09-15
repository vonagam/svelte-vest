import * as Vest from "vest";
import {Access} from "./Access.js";

export declare namespace Test {
  type Get<T = any, F extends string = keyof T & string> = Access.Get<T, F>;
  type Enforced = ReturnType<typeof Vest["enforce"]>;
  type Enforce = (message: string) => Enforced;
  type Body = (enforce: Enforce) => void | Promise<void>;
}

export type Test<T = any, F extends string = keyof T & string> = (field: F, test: Test.Body) => void;

export const Test = <T, F extends string = keyof T & string>(values: T, get: Test.Get<T, F> = Access.get) => {
  const test: Test<T, F> = (field, run) => {
    Vest.test(field, () => {
      const value = get(values, field);
      const enforce = (message: string) => Vest.enforce(value).message(message);
      return run(enforce);
    });
  };

  return test;
};
