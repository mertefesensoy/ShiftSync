'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardRedirect() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            // Not authenticated, redirect to login
            router.push('/login');
            return;
        }

        // Redirect based on role
        if (session.user.role === 'MANAGER') {
            router.push('/manager');
        } else {
            // For workers, redirect to worker dashboard (when we build it)
            router.push('/manager'); // Temporary: redirect to manager for now
        }
    }, [session, status, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
