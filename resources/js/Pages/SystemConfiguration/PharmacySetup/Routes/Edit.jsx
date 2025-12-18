import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import RouteForm from './RouteForm';

export default function Edit({ auth, routeItem }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Route</h2>}>
            <Head title="Edit Route" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    <RouteForm routeItem={routeItem} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}