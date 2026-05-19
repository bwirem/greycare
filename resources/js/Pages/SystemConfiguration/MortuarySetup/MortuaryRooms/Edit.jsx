import React from 'react';
import AuthenticatedLayout from '@/Layouts/MortuaryLayout';
import { Head } from '@inertiajs/react';
import RoomForm from './RoomForm';

export default function Edit({ auth, room, mortuaries, activePriceCategories }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-slate-800">Edit Mortuary Room & Manage Cabinets</h2>}
        >
            <Head title="Edit Mortuary Room" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <RoomForm room={room} mortuaries={mortuaries} activePriceCategories={activePriceCategories} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}