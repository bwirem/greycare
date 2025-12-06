import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import ParameterForm from './ParameterForm';

export default function Edit({ auth, parameter, panels }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Parameter</h2>}>
            <Head title="Edit Parameter" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ParameterForm parameter={parameter} panels={panels} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}