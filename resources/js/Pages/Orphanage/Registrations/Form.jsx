import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faSpinner,
    faClipboardList,
    faUser
} from "@fortawesome/free-solid-svg-icons";

// Helper function to safely format dates for <input type="date">
const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
};

export default function Form({ registration = null, registrationTypes = [] }) {
    
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: registration?.first_name || "",
        middle_name: registration?.middle_name || "",
        last_name: registration?.last_name || "",
        gender: registration?.gender || "",
        date_of_birth: formatDate(registration?.date_of_birth),
        registration_type_id: registration?.registration_type_id || "",
        institution: registration?.institution || "",
        physicaladdress: registration?.physicaladdress || "",
        contact: registration?.contact || "",
        transdate: formatDate(registration?.transdate),
    });

    const submit = (e) => {
        e.preventDefault();

        if (registration) {
            put(route("orphanage0.update", registration.autocode));
        } else {
            post(route("orphanage0.store"));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            {/* Child Details Section */}
            <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Child Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Show Child Code only on edit mode (Read Only) */}
                    {registration && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Child Code</label>
                            <input
                                type="text"
                                value={registration.childcode || ""}
                                disabled
                                className="w-full md:w-1/2 mt-1 border rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Child code is auto-generated and cannot be changed.</p>
                        </div>
                    )}

                    {/* First Name */}
                    <div>
                        <label className="text-sm font-medium">First Name *</label>
                        <input
                            type="text"
                            value={data.first_name}
                            onChange={(e) => setData("first_name", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>

                    {/* Middle Name */}
                    <div>
                        <label className="text-sm font-medium">Middle Name</label>
                        <input
                            type="text"
                            value={data.middle_name}
                            onChange={(e) => setData("middle_name", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.middle_name && <p className="text-red-500 text-xs mt-1">{errors.middle_name}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="text-sm font-medium">Last Name *</label>
                        <input
                            type="text"
                            value={data.last_name}
                            onChange={(e) => setData("last_name", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-sm font-medium">Gender *</label>
                        <select
                            value={data.gender}
                            onChange={(e) => setData("gender", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2 bg-white"
                        >
                            <option value="">-- Select Gender --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="text-sm font-medium">Date of Birth *</label>
                        <input
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) => setData("date_of_birth", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                            max={new Date().toISOString().split("T")[0]} // Prevents future dates
                        />
                        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                    </div>

                </div>
            </div>

            {/* Registration Details Section */}
            <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                    Registration Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Registration Type */}
                    <div>
                        <label className="text-sm font-medium">Registration Type *</label>
                        <select
                            value={data.registration_type_id}
                            onChange={(e) => setData("registration_type_id", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2 bg-white"
                        >
                            <option value="">-- Select Type --</option>
                            {registrationTypes.map((type) => (
                                <option key={type.autocode} value={type.autocode}>
                                    {type.description}
                                </option>
                            ))}
                        </select>
                        {errors.registration_type_id && (
                            <p className="text-red-500 text-xs mt-1">{errors.registration_type_id}</p>
                        )}
                    </div>

                    {/* Trans Date */}
                    <div>
                        <label className="text-sm font-medium">Registration Date *</label>
                        <input
                            type="date"
                            value={data.transdate}
                            onChange={(e) => setData("transdate", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.transdate && (
                            <p className="text-red-500 text-xs mt-1">{errors.transdate}</p>
                        )}
                    </div>

                    {/* Institution */}
                    <div>
                        <label className="text-sm font-medium">Institution</label>
                        <input
                            type="text"
                            value={data.institution}
                            onChange={(e) => setData("institution", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-sm font-medium">Physical Address</label>
                        <input
                            type="text"
                            value={data.physicaladdress}
                            onChange={(e) => setData("physicaladdress", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.physicaladdress && <p className="text-red-500 text-xs mt-1">{errors.physicaladdress}</p>}
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="text-sm font-medium">Contact</label>
                        <input
                            type="text"
                            value={data.contact}
                            onChange={(e) => setData("contact", e.target.value)}
                            className="w-full mt-1 border rounded-md p-2"
                        />
                        {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                    </div>

                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link
                    href={route("orphanage0.index")}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                    Cancel
                </Link>

                <button
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-75"
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {registration ? "Update Registration" : "Save Registration"}
                </button>
            </div>

        </form>
    );
}