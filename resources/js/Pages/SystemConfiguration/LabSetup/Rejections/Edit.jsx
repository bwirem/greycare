import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import RejectionForm from './RejectionForm';

export default function Edit({ auth, reason }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Rejection Reason</h2>}>
            <Head title="Edit Rejection Reason" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <RejectionForm reason={reason} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}