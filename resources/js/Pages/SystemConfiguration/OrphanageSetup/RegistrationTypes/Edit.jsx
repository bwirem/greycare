import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/Orphanage';
import Form from './Form';

export default function Edit({ auth, registrationType }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-slate-800">
                    Edit Registration Type
                </h2>
            }
        >
            <Head title="Edit Registration Type" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Form registrationType={registrationType} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}