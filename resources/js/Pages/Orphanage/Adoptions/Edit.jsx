import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/Orphanage";
import Form from "./Form";

export default function Edit({
    auth,
    adoption,
    adoptionTypes,
    registrations
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-slate-800">
                    Edit Adoption
                </h2>
            }
        >
            <Head title="Edit Adoption" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <Form
                        adoption={adoption}
                        adoptionTypes={adoptionTypes}
                        registrations={registrations}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}