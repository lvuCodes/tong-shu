// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { COMMIT_DELAY, DraftInput } from "./DraftInput";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("DraftInput", () => {
  it("commits once after typing pauses", () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();
    render(<DraftInput aria-label="Name" value="A" onCommit={onCommit} />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Ab" } });
    fireEvent.change(input, { target: { value: "Abc" } });
    expect(input.value).toBe("Abc");
    expect(onCommit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(COMMIT_DELAY);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("Abc");
  });

  it("commits immediately on blur", () => {
    const onCommit = vi.fn();
    render(<DraftInput aria-label="Name" value="A" onCommit={onCommit} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "B" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith("B");
  });

  it("drops a pending draft when the value is reset from outside", () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();
    const { rerender } = render(<DraftInput aria-label="Name" value="A" onCommit={onCommit} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "B" } });
    rerender(<DraftInput aria-label="Name" value="Reset" onCommit={onCommit} />);
    vi.advanceTimersByTime(COMMIT_DELAY);
    expect(onCommit).not.toHaveBeenCalled();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Reset");
  });
});
