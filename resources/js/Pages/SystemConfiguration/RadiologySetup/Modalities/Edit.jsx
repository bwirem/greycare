import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ModalityForm from './ModalityForm';

export default function Edit({ auth, modality }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Machine</h2>}
        >
            <Head title="Edit Machine" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ModalityForm modality={modality} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}