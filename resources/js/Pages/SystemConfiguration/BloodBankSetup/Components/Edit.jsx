import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ComponentForm from './ComponentForm';

export default function Edit({ auth, component }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Blood Component</h2>}>
            <Head title="Edit Component" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <ComponentForm component={component} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}