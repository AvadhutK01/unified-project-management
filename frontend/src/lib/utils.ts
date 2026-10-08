import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Generate initials from a name string.
 *
 * Examples:
 * - "Acme Corporation" => "AC"
 * - "John Doe" => "JD"
 * - "SingleName" => "SI"
 * - "" => "?"
 * @param name
 * @returns
 */
export const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Generate a color based on a string input.
 * The same input will always produce the same color.
 *
 * This is useful for generating consistent avatar colors based on organization names or user names.
 * @param input
 * @returns
 */
export const getColor = (input: string) => {
    // Muted, professional hues that all carry white initials at AA contrast.
    const colors = [
        "#4f46e5",
        "#0f766e",
        "#be185d",
        "#6d28d9",
        "#0369a1",
        "#15803d",
        "#b45309",
        "#475569",
    ];
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Format a date string into a more human-readable format.
 * Examples:
 * - "2024-06-01T12:34:56Z" => "Jun 1, 2024"
 * - "2023-12-15T08:00:00Z" => "Dec 15, 2023"
 * - "InvalidDate" => "Invalid Date"
 *
 * @param dateString
 * @returns
 */
export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
