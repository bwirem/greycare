import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ProcedureForm from './ProcedureForm';

export default function Edit({ auth, procedure, groups }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Procedure</h2>}
        >
            <Head title="Edit Procedure" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ProcedureForm procedure={procedure} groups={groups} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}