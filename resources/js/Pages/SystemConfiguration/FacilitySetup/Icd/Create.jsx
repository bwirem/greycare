import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import IcdForm from './IcdForm';

export default function Create({ auth, groups }) { // <--- Receive 'groups' here
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Create ICD Diagnosis</h2>}
        >
            <Head title="Create Diagnosis" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {/* Pass 'groups' down to the form */}
                        <IcdForm groups={groups} /> 
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}