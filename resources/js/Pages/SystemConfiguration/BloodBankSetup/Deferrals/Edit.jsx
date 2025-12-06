import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeferralForm from './DeferralForm';

export default function Edit({ auth, deferral }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Deferral Reason</h2>}>
            <Head title="Edit Reason" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <DeferralForm deferral={deferral} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}