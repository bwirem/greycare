import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/Orphanage";
import Form from "./Form";

export default function Create({ auth, registrationTypes }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold">Create Registration</h2>}
        >
            <Head title="Create Registration" />

            <div className="py-12 max-w-5xl mx-auto">
                <Form registrationTypes={registrationTypes} />
            </div>
        </AuthenticatedLayout>
    );
}