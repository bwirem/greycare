import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import DurationForm from './DurationForm';

export default function Edit({ auth, duration }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Duration</h2>}>
            <Head title="Edit Duration" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <DurationForm duration={duration} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}