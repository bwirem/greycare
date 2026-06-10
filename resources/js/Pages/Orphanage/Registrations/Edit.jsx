import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/Orphanage";
import Form from "./Form";

export default function Edit({ auth, registration, registrationTypes }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold">Edit Registration</h2>}
        >
            <Head title="Edit Registration" />

            <div className="py-12 max-w-5xl mx-auto">
                <Form registration={registration} registrationTypes={registrationTypes} />
            </div>
        </AuthenticatedLayout>
    );
}