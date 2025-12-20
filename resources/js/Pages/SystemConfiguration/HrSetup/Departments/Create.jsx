import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import DepartmentForm from './DepartmentForm';

export default function Create({ auth }) {
    return (
        <HumanResourceLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create New Department</h2>}
        >
            <Head title="Create Department" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Add a new department to the organization structure.
                            </p>
                        </div>
                        <DepartmentForm />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}