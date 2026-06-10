import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faSpinner,
    faPersonWalkingArrowRight
} from "@fortawesome/free-solid-svg-icons";

export default function Form({
    discharge = null,
    registrations = []
}) {

    const { data, setData, post, put, processing, errors } = useForm({

        childcode: discharge?.childcode || "",
        transdate: discharge?.transdate
            ? discharge.transdate.substring(0, 10)
            : "",

        parentname: discharge?.parentname || "",
        guardianname: discharge?.guardianname || "",
        relationship: discharge?.relationship || "",
        physicaladdress: discharge?.physicaladdress || "",
        contact: discharge?.contact || "",
    });

    const submit = (e) => {

        e.preventDefault();

        if (discharge) {

            put(
                route(
                    "orphanage2.update",
                    discharge.autocode
                )
            );

        } else {

            post(
                route(
                    "orphanage2.store"
                )
            );
        }
    };

    return (

        <form
            onSubmit={submit}
            className="space-y-6"
        >

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">

                <h3 className="text-sm font-bold uppercase border-b pb-2 mb-6 text-slate-700">

                    <FontAwesomeIcon
                        icon={faPersonWalkingArrowRight}
                        className="mr-2 text-slate-500"
                    />

                    Discharge Information

                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Child */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Child *
                        </label>

                        <select
                            value={data.childcode}
                            onChange={(e) =>
                                setData(
                                    "childcode",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        >
                            <option value="">
                                Select Child
                            </option>

                            {registrations.map((item) => (

                                <option
                                    key={item.autocode}
                                    value={item.childcode}
                                >
                                    {item.childcode}
                                </option>

                            ))}
                        </select>

                        {errors.childcode && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.childcode}
                            </p>
                        )}

                    </div>

                    {/* Date */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Discharge Date *
                        </label>

                        <input
                            type="date"
                            value={data.transdate}
                            onChange={(e) =>
                                setData(
                                    "transdate",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                        {errors.transdate && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.transdate}
                            </p>
                        )}

                    </div>

                    {/* Parent */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Parent Name *
                        </label>

                        <input
                            type="text"
                            value={data.parentname}
                            onChange={(e) =>
                                setData(
                                    "parentname",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                        {errors.parentname && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.parentname}
                            </p>
                        )}

                    </div>

                    {/* Guardian */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Guardian Name
                        </label>

                        <input
                            type="text"
                            value={data.guardianname}
                            onChange={(e) =>
                                setData(
                                    "guardianname",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                    </div>

                    {/* Relationship */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Relationship
                        </label>

                        <input
                            type="text"
                            value={data.relationship}
                            onChange={(e) =>
                                setData(
                                    "relationship",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                    </div>

                    {/* Contact */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700">
                            Contact
                        </label>

                        <input
                            type="text"
                            value={data.contact}
                            onChange={(e) =>
                                setData(
                                    "contact",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                    </div>

                    {/* Address */}

                    <div className="md:col-span-2">

                        <label className="block text-sm font-medium text-slate-700">
                            Physical Address
                        </label>

                        <textarea
                            rows="3"
                            value={data.physicaladdress}
                            onChange={(e) =>
                                setData(
                                    "physicaladdress",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border-slate-300"
                        />

                    </div>

                </div>

            </div>

            <div className="flex justify-end gap-4 border-t pt-4">

                <Link
                    href={route("orphanage2.index")}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                    Cancel
                </Link>

                <button
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? (
                        <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faSave}
                        />
                    )}

                    {discharge
                        ? "Update Discharge"
                        : "Save Discharge"}
                </button>

            </div>

        </form>
    );
}