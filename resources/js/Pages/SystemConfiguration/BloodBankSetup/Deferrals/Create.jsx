import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeferralForm from './DeferralForm';

export default function Create({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Create Deferral Reason</h2>}>
            <Head title="Create Reason" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <DeferralForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}