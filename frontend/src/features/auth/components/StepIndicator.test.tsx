import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "./StepIndicator";

describe("StepIndicator Component", () => {
    const steps = [
        { label: "Step A" },
        { label: "Step B" },
        { label: "Step C" },
    ];

    it("should render steps label correctly", () => {
        render(<StepIndicator current={1} steps={steps} />);

        expect(screen.getByText("Step A")).toBeInTheDocument();
        expect(screen.getByText("Step B")).toBeInTheDocument();
        expect(screen.getByText("Step C")).toBeInTheDocument();
    });

    it("should render done and active step elements differently", () => {
        const { container } = render(
            <StepIndicator current={1} steps={steps} />,
        );

        // Step A (index 0) is done (i < current) -> should display Check icon
        // Step B (index 1) is active (i === current) -> should display 2
        // Step C (index 2) is pending -> should display 3

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();

        // Check for Check icon inside Step A
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });

    it("should mark all steps as done when current exceeds step count", () => {
        const { container } = render(
            <StepIndicator current={3} steps={steps} />,
        );

        const svgs = container.querySelectorAll("svg");
        expect(svgs).toHaveLength(3);
        expect(screen.queryByText("1")).not.toBeInTheDocument();
        expect(screen.queryByText("2")).not.toBeInTheDocument();
        expect(screen.queryByText("3")).not.toBeInTheDocument();
    });

    it("should mark all steps as pending when current is 0", () => {
        render(<StepIndicator current={0} steps={steps} />);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.queryByText("4")).not.toBeInTheDocument();
    });

    it("should handle a single step", () => {
        render(<StepIndicator current={0} steps={[{ label: "Only Step" }]} />);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Only Step")).toBeInTheDocument();
    });

    it("should handle empty steps array", () => {
        const { container } = render(<StepIndicator current={0} steps={[]} />);

        expect(container.firstChild).toBeEmptyDOMElement();
    });
});
