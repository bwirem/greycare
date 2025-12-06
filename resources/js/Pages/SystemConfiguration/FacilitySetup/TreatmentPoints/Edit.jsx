import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import PointForm from './PointForm';

export default function Edit({ auth, point }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Treatment Point</h2>}
        >
            <Head title="Edit Clinic" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <PointForm point={point} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}