import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import TaxBracketForm from './TaxBracketForm';

export default function Edit({ auth, tax }) {
    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Tax Bracket</h2>}>
            <Head title="Edit" />
            <div className="py-12"><div className="mx-auto max-w-4xl sm:px-6 lg:px-8"><div className="bg-white p-6 shadow sm:rounded-lg"><TaxBracketForm tax={tax} /></div></div></div>
        </HumanResourceLayout>
    );
}