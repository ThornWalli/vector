// @ts-nocheck
import {
  operatorCalc, cachedValueOf, defineVectorLength, cachedFactory, cachedFunction
} from '../operator';

function fallbackWindow() {
  return {
    addEventListener() { }
  };
}
export function hijackPlayCanvas(pc) {
  const {
    Vec2, Vec3, Quat, Mat4
  } = pc;

  cachedValueOf(Vec2);
  defineVectorLength(Vec2, 2);
  const vec2Factory = cachedFactory(Vec2);
  pc.vec2 = (x, y) => {
    if (typeof x === 'function') {
      return operatorCalc(x, new Vec2());
    }
    return vec2Factory(x, y);
  };

  cachedValueOf(Vec3);
  defineVectorLength(Vec3, 3);
  const vec3Factory = cachedFactory(Vec3);
  pc.vec3 = (x, y, z) => {
    if (typeof x === 'function') {
      return operatorCalc(x, new Vec3());
    }
    return vec3Factory(x, y, z);
  };

  pc.calc = operatorCalc;

  Object.defineProperty(Quat.prototype, 'left', {
    get() {
      return this.transformVector(Vec3.LEFT, new Vec3());
    },
    set() {
      throw new Error('set left not allowed');
    }
  });
  Object.defineProperty(Quat.prototype, 'dir', {
    get() {
      return this.transformVector(Vec3.FORWARD, new Vec3());
    },
    set() {
      throw new Error('set dir not allowed');
    }
  });
  Object.defineProperty(Quat.prototype, 'up', {
    get() {
      return this.transformVector(Vec3.UP, new Vec3());
    },
    set() {
      throw new Error('set up not allowed');
    }
  });
  pc.quat = cachedFunction((x, y, z, w) => {
    if (typeof dir === 'number') {
      return new Quat(x, y, z, w);
    }
    if (!x) {
      return new Quat();
    }
    return new Quat().setFromMat4(new Mat4().setLookAt(Vec3.ZERO, x, y || Vec3.UP));
  });
}

// eslint-disable-next-line no-undef
const global = typeof window === 'undefined' ? fallbackWindow() : window;
global.addEventListener('load', () => {
  const { pc } = global;
  if (!pc) {
    console.warn('no playcanvas in global namespace found');
  } else {
    hijackPlayCanvas(pc);
  }
});