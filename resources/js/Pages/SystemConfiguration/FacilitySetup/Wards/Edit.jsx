import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import WardForm from './WardForm';

export default function Edit({ auth, ward }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Ward</h2>}
        >
            <Head title="Edit Clinic" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <WardForm ward={ward} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}