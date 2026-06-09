import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import GroupForm from './GroupForm';

export default function Create({ auth, activePriceCategories }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Create Billing Group</h2>}
        >
            <Head title="Create Billing Group" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <GroupForm activePriceCategories={activePriceCategories} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}