import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head } from '@inertiajs/react';
import SessionForm from './SessionForm';

export default function Create({ auth, treatmentTypes }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Therapy Session</h2>}
        >
            <Head title="New Session" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <SessionForm treatmentTypes={treatmentTypes} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}