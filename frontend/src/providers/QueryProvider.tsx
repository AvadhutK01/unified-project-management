import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 2, // 2 minutes - data is fresh for 2 minutes
                        gcTime: 5 * 60 * 1000, // 5 minutes - keep unused data in cache for 5 minutes

                        refetchOnWindowFocus: false, // Refetch when window regains focus
                        refetchOnReconnect: true, // Refetch when connection is restored

                        retry: 1, // Retry failed requests once

                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
                    },
                    mutations: {
                        retry: 0, // Retry failed mutations never
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
