// packages/sdk/src/settings.ts
import { cleanSettings } from "@nswp/core";
var arrived = {};
var parts = /* @__PURE__ */ new Map();
function arriveWith(settings) {
  arrived = cleanSettings(settings);
}
function arrivedSettings() {
  return arrived;
}
function reportSettings(part, now) {
  parts.set(part, now);
  return () => {
    if (parts.get(part) === now) parts.delete(part);
  };
}
function currentSettings() {
  let out = { ...arrived };
  for (const now of parts.values()) {
    let said = {};
    try {
      said = cleanSettings(now());
    } catch {
    }
    out = { ...out, ...said, ...said.sound || out.sound ? { sound: { ...out.sound, ...said.sound } } : {} };
  }
  return cleanSettings(out);
}

export {
  arriveWith,
  arrivedSettings,
  reportSettings,
  currentSettings
};
