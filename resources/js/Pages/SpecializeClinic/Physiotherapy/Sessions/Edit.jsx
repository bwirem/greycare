import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head } from '@inertiajs/react';
import SessionForm from './SessionForm';

export default function Edit({ auth, session, treatmentTypes }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Session / Feedback</h2>}
        >
            <Head title="Edit Session" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <SessionForm session={session} treatmentTypes={treatmentTypes} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}