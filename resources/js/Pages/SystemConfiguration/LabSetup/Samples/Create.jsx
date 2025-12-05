import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import SampleForm from './SampleForm';

export default function Create({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Create Sample Type</h2>}
        >
            <Head title="Create Sample Type" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {/* We reuse the shared form here */}
                        <SampleForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}