import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import TheatreForm from './TheatreForm';

export default function EditTheatre({ auth, theatre }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Theatre</h2>}>
            <Head title="Edit Theatre" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 border-b pb-2">Update Theatre Details</h3>
                        <TheatreForm theatre={theatre} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}