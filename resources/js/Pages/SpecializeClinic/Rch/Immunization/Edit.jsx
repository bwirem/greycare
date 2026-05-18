import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head } from '@inertiajs/react';
import ImmunizationForm from './ImmunizationForm';

export default function Edit({ auth, record, vaccines }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Immunization Record</h2>}
        >
            <Head title="Edit Immunization" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ImmunizationForm record={record} vaccines={vaccines} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}