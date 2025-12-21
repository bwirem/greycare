import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head } from '@inertiajs/react';
import VaccineForm from './VaccineForm';

export default function Edit({ auth, vaccine }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Vaccine</h2>}
        >
            <Head title="Edit Vaccine" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <VaccineForm vaccine={vaccine} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}