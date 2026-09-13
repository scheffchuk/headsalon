import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRateLimitCountdown } from "./use-rate-limit-countdown";

describe("useRateLimitCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("counts down a retry delay and then re-enables the operation", () => {
    const { result } = renderHook(() => useRateLimitCountdown());

    act(() => result.current.start(2_001));
    expect(result.current.secondsRemaining).toBe(3);
    expect(result.current.isRateLimited).toBe(true);

    act(() => vi.advanceTimersByTime(1_100));
    expect(result.current.secondsRemaining).toBe(1);

    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.secondsRemaining).toBeNull();
    expect(result.current.isRateLimited).toBe(false);
  });
});
