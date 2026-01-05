import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import TheatreForm from './TheatreForm';

export default function CreateTheatre({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Add New Theatre</h2>}>
            <Head title="Create Theatre" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 border-b pb-2">Enter Theatre Details</h3>
                        <TheatreForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}