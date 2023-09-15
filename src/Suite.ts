import * as Vest from "vest";
import {Test} from "./Test.js";

export declare namespace Suite {
  type Body<T = any, F extends string = keyof T & string> = (values: T, test: Test<T, F>) => void;
  type Get<T = any, F extends string = keyof T & string> = Test.Get<T, F>;
  type Callback<T = any, F extends string = keyof T & string> = (values: T, field?: F | F[]) => void;
  type Result<T = any, F extends string = keyof T & string> = Vest.SuiteResult<F, string>;
  type RunResult<T = any, F extends string = keyof T & string> = Vest.SuiteRunResult<F, string>;
}

export type Suite<T = any, F extends string = keyof T & string> = Vest.Suite<F, string, Suite.Callback<T, F>>;

export const Suite = <T, F extends string = keyof T & string>(run: Suite.Body<T, F>, get?: Suite.Get<T, F>) => {
  const suite: Suite<T, F> = Vest.create((data: T, field?: F | F[]) => {
    Vest.only(field);
    const test = Test(data, get);
    run(data, test);
  });

  return suite;
};
