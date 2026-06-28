import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpInputRow } from "./OtpInputRow";

describe("OtpInputRow Component", () => {
    it("should render correct number of input boxes with correct values", () => {
        const refs = { current: [] } as any;
        render(
            <OtpInputRow
                otp={["1", "2", "", ""]}
                refs={refs}
                otp_length={4}
                handleChange={vi.fn()}
                handleKeyDown={vi.fn()}
                handlePaste={vi.fn()}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs).toHaveLength(4);
        expect(inputs[0]).toHaveValue("1");
        expect(inputs[1]).toHaveValue("2");
        expect(inputs[2]).toHaveValue("");
        expect(inputs[3]).toHaveValue("");
    });

    it("should trigger callbacks on change, keydown, and paste", async () => {
        const user = userEvent.setup();
        const refs = { current: [] } as any;
        const handleChange = vi.fn();
        const handleKeyDown = vi.fn();
        const handlePaste = vi.fn();

        render(
            <OtpInputRow
                otp={["", "", "", ""]}
                refs={refs}
                otp_length={4}
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
                handlePaste={handlePaste}
            />,
        );

        const inputs = screen.getAllByRole("textbox");

        await user.type(inputs[0], "5");
        expect(handleChange).toHaveBeenCalledWith(0, "5");

        await user.type(inputs[0], "{backspace}");
        expect(handleKeyDown).toHaveBeenCalled();

        // Testing paste triggers handlePaste
        const pasteEvent = new Event("paste", { bubbles: true });
        inputs[0].dispatchEvent(pasteEvent);
        expect(handlePaste).toHaveBeenCalled();
    });

    it("should autofocus the first input if autofocus prop is true", () => {
        const refs = { current: [] } as any;
        render(
            <OtpInputRow
                otp={["", "", "", ""]}
                refs={refs}
                otp_length={4}
                handleChange={vi.fn()}
                handleKeyDown={vi.fn()}
                handlePaste={vi.fn()}
                autoFocus={true}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs[0]).toHaveFocus();
    });

    it("should not autofocus when autoFocus is false", () => {
        const refs = { current: [] } as any;
        render(
            <OtpInputRow
                otp={["", "", "", ""]}
                refs={refs}
                otp_length={4}
                handleChange={vi.fn()}
                handleKeyDown={vi.fn()}
                handlePaste={vi.fn()}
                autoFocus={false}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs[0]).not.toHaveFocus();
    });

    it("should render a single input box when otp_length is 1", () => {
        const refs = { current: [] } as any;
        render(
            <OtpInputRow
                otp={[""]}
                refs={refs}
                otp_length={1}
                handleChange={vi.fn()}
                handleKeyDown={vi.fn()}
                handlePaste={vi.fn()}
            />,
        );

        expect(screen.getAllByRole("textbox")).toHaveLength(1);
    });

    it("should apply filled styling when otp value is present", () => {
        const refs = { current: [] } as any;
        render(
            <OtpInputRow
                otp={["9", "", "", ""]}
                refs={refs}
                otp_length={4}
                handleChange={vi.fn()}
                handleKeyDown={vi.fn()}
                handlePaste={vi.fn()}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs[0].className).toContain("border-primary/60");
        expect(inputs[1].className).not.toContain("border-primary/60");
    });
});
