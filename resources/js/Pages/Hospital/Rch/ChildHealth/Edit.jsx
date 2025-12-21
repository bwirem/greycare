import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import GrowthForm from './GrowthForm';

export default function Edit({ auth, assessment }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Growth Record</h2>}
        >
            <Head title="Edit Assessment" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <GrowthForm assessment={assessment} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}