import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import ProcedureForm from './ProcedureForm';

export default function Edit({ auth, procedure, modalities }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Radiology Exam</h2>}
        >
            <Head title="Edit Exam" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {/* Pass procedure data and modalities list */}
                        <ProcedureForm procedure={procedure} modalities={modalities} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}