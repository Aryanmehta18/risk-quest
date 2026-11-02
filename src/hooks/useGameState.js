import { useSyncExternalStore } from "react";
import { subscribe, getState, getReady } from "../lib/store";

export function useGameState() {
  return useSyncExternalStore(subscribe, getState);
}

export function useReady() {
  return useSyncExternalStore(subscribe, getReady);
}