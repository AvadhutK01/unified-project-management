import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface CustomRenderOptions extends Omit<RenderOptions, "queries"> {
    route?: string;
    initialEntries?: any[];
    queryClient?: QueryClient;
}

export function renderWithProviders(
    ui: ReactElement,
    {
        route = "/",
        initialEntries,
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, gcTime: 0 },
                mutations: { retry: false },
            },
        }),
        ...renderOptions
    }: CustomRenderOptions = {},
) {
    const entries = initialEntries || [route];
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <GoogleOAuthProvider clientId="test-client-id">
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={entries}>
                        {children}
                    </MemoryRouter>
                </QueryClientProvider>
            </GoogleOAuthProvider>
        );
    }
    return {
        user: userEvent.setup(),
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
}
