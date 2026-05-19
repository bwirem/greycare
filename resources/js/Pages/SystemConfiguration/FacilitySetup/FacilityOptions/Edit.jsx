import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import FacilityOptionForm from './FacilityOptionForm';

export default function Edit({ auth, facilityoption, chartOfAccounts, billinggroups, deathstatuses }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Facility Option</h2>}>
            <Head title={`Edit ${facilityoption.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <FacilityOptionForm option={facilityoption} chartOfAccounts={chartOfAccounts} billinggroups={billinggroups} deathstatuses={deathstatuses} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
