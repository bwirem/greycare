import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import SpecializationForm from './SpecializationForm';

export default function Create({ auth, billItems }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Add Specialization</h2>}>
            <Head title="Create Specialization" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <SpecializationForm billItems={billItems} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}