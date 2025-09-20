'use client';

import { useCallback, useState } from 'react';

export function useLoadingCallback<
    // biome-ignore lint/suspicious/noExplicitAny: We do not know the types of the arguments or return value
    T extends (...args: any[]) => Promise<any>,
>(callback: T) {
    const [loading, setLoading] = useState(false);

    const wrapped = useCallback(
        async (...args: Parameters<T>) => {
            setLoading(true);
            try {
                return await callback(...args);
            } finally {
                setLoading(false);
            }
        },
        [callback]
    );

    return [wrapped, loading] as const;
}
