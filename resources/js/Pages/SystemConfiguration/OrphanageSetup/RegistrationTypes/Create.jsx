import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/Orphanage';
import Form from './Form';

export default function Create({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-slate-800">
                    Create Registration Type
                </h2>
            }
        >
            <Head title="Create Registration Type" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Form />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}