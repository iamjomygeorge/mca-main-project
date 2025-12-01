"use client";

import Link from 'next/link';
import Container from '@/components/Container';

export default function PurchaseCancelPage() {
    return (
        <Container className="py-20 text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Payment Cancelled</h1>
            <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8">Your purchase was not completed. You have not been charged.</p>
             <Link href="/books" className="rounded-md bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600">
                Continue Browsing
            </Link>
        </Container>
    );
}