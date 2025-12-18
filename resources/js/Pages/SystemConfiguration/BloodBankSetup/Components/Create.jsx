import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ComponentForm from './ComponentForm';

export default function Create({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Create Blood Component</h2>}>
            <Head title="Create Component" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <ComponentForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}