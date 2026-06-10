import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: (cb: IdleRequestCallback) => setTimeout(cb, 0),
});

Object.defineProperty(window, "cancelIdleCallback", {
  writable: true,
  value: (id: number) => clearTimeout(id),
});

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      type: "",
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    };
  }
}

const lsStore: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => lsStore[key] ?? null,
  setItem: (key: string, value: string) => {
    lsStore[key] = value;
  },
  removeItem: (key: string) => {
    delete lsStore[key];
  },
  clear: () => {
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  },
  key: (index: number) => Object.keys(lsStore)[index] ?? null,
  get length() {
    return Object.keys(lsStore).length;
  },
};

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: MockAudioContext,
});
