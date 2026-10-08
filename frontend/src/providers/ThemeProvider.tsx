import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App-wide light / dark / system theme.
 * Applies the `.dark` class on <html>, which the design tokens in
 * index.css key off. The choice is persisted per browser by next-themes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="unified-theme"
        >
            {children}
        </NextThemesProvider>
    );
}

export default ThemeProvider;
