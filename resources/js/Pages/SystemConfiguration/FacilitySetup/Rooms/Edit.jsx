import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head } from '@inertiajs/react';
import RoomForm from './RoomForm';

export default function Edit({ auth, room, wards }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit Room & Manage Beds</h2>}
        >
            <Head title="Edit Room" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <RoomForm room={room} wards={wards} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}