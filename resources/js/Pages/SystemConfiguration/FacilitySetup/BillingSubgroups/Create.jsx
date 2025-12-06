import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import SubgroupForm from './SubgroupForm';

export default function Create({ auth, billingGroups }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Create Billing Scheme</h2>}
        >
            <Head title="Create Scheme" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {/* Pass billingGroups to the form for the dropdown */}
                        <SubgroupForm billingGroups={billingGroups} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}