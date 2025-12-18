import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import GroupForm from './GroupForm';

export default function Edit({ auth, group }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Procedure Group</h2>}
        >
            <Head title="Edit Group" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <GroupForm group={group} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}