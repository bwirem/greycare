import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ImmunizationForm from './ImmunizationForm';

export default function Create({ auth, vaccines }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Administer Vaccine</h2>}
        >
            <Head title="New Immunization" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ImmunizationForm vaccines={vaccines} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}