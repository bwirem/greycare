import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import FacilityOptionForm from './FacilityOptionForm';

export default function Create({ auth, chartOfAccounts, billinggroups }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Create New Facility Option</h2>}>
            <Head title="Create Facility Option" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <FacilityOptionForm chartOfAccounts={chartOfAccounts} billinggroups={billinggroups} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
