export const lazyPrototype = (proto: any) => {
  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
    const {get, value} = descriptor;

    if (typeof value === "function" && name !== "constructor") {
      Object.defineProperty(proto, name, {configurable: true, get() {
        const bind = value.bind(this);
        Object.defineProperty(this, name, {configurable: true, value: bind});
        return bind;
      }});
    }

    if (typeof get === "function") {
      Object.defineProperty(proto, name, {configurable: true, get() {
        const got = get.apply(this);
        Object.defineProperty(this, name, {configurable: true, value: got});
        return got;
      }});
    }
  }
};
