import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import CategoryForm from './CategoryForm';

export default function Edit({ auth, category }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Lab Category</h2>}>
            <Head title="Edit Category" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <CategoryForm category={category} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}