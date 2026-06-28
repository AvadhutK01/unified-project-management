import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useOtpInput } from "./useOtpInput";

describe("useOtpInput Hook", () => {
    it("should initialize with correct default state", () => {
        const { result } = renderHook(() => useOtpInput(4));
        expect(result.current.otp).toEqual(["", "", "", ""]);
        expect(result.current.filled).toBe(false);
    });

    it("should update otp digits on handleChange and focus next input", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
            null,
        ];

        act(() => {
            result.current.handleChange(0, "5");
        });

        expect(result.current.otp).toEqual(["5", "", "", ""]);
        expect(focusSpy).toHaveBeenCalled();
    });

    it("should not focus next input if digit is empty", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
            null,
        ];

        act(() => {
            result.current.handleChange(0, "");
        });

        expect(result.current.otp).toEqual(["", "", "", ""]);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should focus previous input on Backspace keydown when current value is empty", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
            null,
            null,
        ];

        const mockEvent = {
            key: "Backspace",
        } as React.KeyboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handleKeyDown(1, mockEvent);
        });

        expect(focusSpy).toHaveBeenCalled();
    });

    it("should handle paste events correctly and focus correct input", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
        ];

        const preventDefault = vi.fn();
        const mockPasteEvent = {
            preventDefault,
            clipboardData: {
                getData: () => "89",
            },
        } as unknown as React.ClipboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handlePaste(mockPasteEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(result.current.otp).toEqual(["8", "9", "", ""]);
        expect(focusSpy).toHaveBeenCalled();
    });

    it("should mark filled as true when all digits are populated", () => {
        const { result } = renderHook(() => useOtpInput(2));

        act(() => {
            result.current.handleChange(0, "1");
        });
        expect(result.current.filled).toBe(false);

        act(() => {
            result.current.handleChange(1, "2");
        });
        expect(result.current.filled).toBe(true);
    });

    it("should reset otp to empty strings", () => {
        const { result } = renderHook(() => useOtpInput(3));

        act(() => {
            result.current.handleChange(0, "1");
        });
        act(() => {
            result.current.handleChange(1, "2");
        });

        expect(result.current.otp).toEqual(["1", "2", ""]);

        act(() => {
            result.current.reset();
        });

        expect(result.current.otp).toEqual(["", "", ""]);
    });

    it("should filter non-numeric characters on handleChange", () => {
        const { result } = renderHook(() => useOtpInput(4));

        act(() => {
            result.current.handleChange(0, "a");
        });

        expect(result.current.otp).toEqual(["", "", "", ""]);
    });

    it("should take only the last digit on handleChange for multi-character input", () => {
        const { result } = renderHook(() => useOtpInput(4));

        act(() => {
            result.current.handleChange(0, "123");
        });

        expect(result.current.otp).toEqual(["3", "", "", ""]);
    });

    it("should handle paste of fewer digits than otp_length", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
        ];

        const preventDefault = vi.fn();
        const mockPasteEvent = {
            preventDefault,
            clipboardData: { getData: () => "12" },
        } as unknown as React.ClipboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handlePaste(mockPasteEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(result.current.otp).toEqual(["1", "2", "", ""]);
        expect(focusSpy).toHaveBeenCalled();
    });

    it("should handle paste of more digits than otp_length (clamping)", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            null,
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
        ];

        const preventDefault = vi.fn();
        const mockPasteEvent = {
            preventDefault,
            clipboardData: { getData: () => "12345678" },
        } as unknown as React.ClipboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handlePaste(mockPasteEvent);
        });

        expect(result.current.otp).toEqual(["1", "2", "3", "4"]);
        expect(focusSpy).toHaveBeenCalled();
    });

    it("should handle paste of empty string", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            null,
            null,
            null,
            { focus: focusSpy } as unknown as HTMLInputElement,
        ];

        const preventDefault = vi.fn();
        const mockPasteEvent = {
            preventDefault,
            clipboardData: { getData: () => "" },
        } as unknown as React.ClipboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handlePaste(mockPasteEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(result.current.otp).toEqual(["", "", "", ""]);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should not focus previous on Backspace at index 0", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
            null,
            null,
        ];

        const mockEvent = {
            key: "Backspace",
        } as React.KeyboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handleKeyDown(0, mockEvent);
        });

        expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should not focus previous on Backspace when current value is filled", () => {
        const { result } = renderHook(() => useOtpInput(4));
        const focusSpy = vi.fn();
        result.current.refs.current = [
            { focus: focusSpy } as unknown as HTMLInputElement,
            null,
            null,
            null,
        ];

        act(() => {
            result.current.handleChange(1, "5");
        });

        const mockEvent = {
            key: "Backspace",
        } as React.KeyboardEvent<HTMLInputElement>;

        act(() => {
            result.current.handleKeyDown(1, mockEvent);
        });

        expect(focusSpy).not.toHaveBeenCalled();
    });
});
