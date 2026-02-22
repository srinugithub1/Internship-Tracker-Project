import { QueryClient } from "@tanstack/react-query";

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
    const url = queryKey[0] as string;
    const res = await fetch(url, {
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || "Request failed");
    }
    return res.json();
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: defaultQueryFn,
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 0,
        },
    },
});


export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
): Promise<any> {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || "An error occurred");
    }

    if (res.status === 204) return null;
    return res.json();
}
