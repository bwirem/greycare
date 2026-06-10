import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faSpinner,
    faPeopleArrows,
    faBuilding,
    faUsers
} from "@fortawesome/free-solid-svg-icons";

export default function Form({
    adoption = null,
    adoptionTypes = [],
    registrations = []
}) {

    const { data, setData, post, put, processing, errors } = useForm({

        childcode: adoption?.childcode || "",
        adoption_type_id: adoption?.adoption_type_id || "",
        transdate: adoption?.transdate || "",

        orphanagename: adoption?.orphanagename || "",
        personincharge: adoption?.personincharge || "",
        position: adoption?.position || "",
        institution: adoption?.institution || "",

        adoptivefather: adoption?.adoptivefather || "",
        adoptivemother: adoption?.adoptivemother || "",
        maritalstatus: adoption?.maritalstatus || "",
        numberofbloodchildren: adoption?.numberofbloodchildren || 0,
        numberofadoptedchildren: adoption?.numberofadoptedchildren || 0,
        profession: adoption?.profession || "",
        physicaladdress: adoption?.physicaladdress || "",

        contact: adoption?.contact || ""
    });

    const submit = (e) => {
        e.preventDefault();

        if (adoption) {
            put(route(
                "orphanage1.update",
                adoption.id
            ));
        } else {
            post(route(
                "orphanage1.store"
            ));
        }
    };

    const selectedType = adoptionTypes.find(
        x => x.autocode == data.adoption_type_id
    );

    return (
        <form onSubmit={submit} className="space-y-6">

            {/* Adoption Info */}

            <div className="p-4 bg-white border rounded-lg shadow-sm">

                <h3 className="text-sm font-bold uppercase border-b pb-2 mb-4">
                    <FontAwesomeIcon
                        icon={faPeopleArrows}
                        className="mr-2 text-slate-500"
                    />
                    Adoption Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                        <label>Child *</label>

                        <select
                            value={data.childcode}
                            onChange={(e) =>
                                setData("childcode", e.target.value)
                            }
                            className="w-full rounded-md border-slate-300"
                        >
                            <option value="">
                                Select Child
                            </option>

                            {registrations.map(item => (
                                <option
                                    key={item.autocode}
                                    value={item.childcode}
                                >
                                    {item.childcode}
                                </option>
                            ))}
                        </select>

                        {errors.childcode &&
                            <p className="text-red-500 text-xs">
                                {errors.childcode}
                            </p>
                        }
                    </div>

                    <div>
                        <label>Adoption Type *</label>

                        <select
                            value={data.adoption_type_id}
                            onChange={(e) =>
                                setData(
                                    "adoption_type_id",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-md border-slate-300"
                        >
                            <option value="">
                                Select Type
                            </option>

                            {adoptionTypes.map(type => (
                                <option
                                    key={type.autocode}
                                    value={type.autocode}
                                >
                                    {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Transaction Date *</label>

                        <input
                            type="date"
                            value={data.transdate}
                            onChange={(e) =>
                                setData(
                                    "transdate",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-md border-slate-300"
                        />
                    </div>

                </div>

            </div>

            {/* Orphanage */}

            {selectedType?.orphanagetoorphanages == 1 && (

                <div className="p-4 bg-white border rounded-lg shadow-sm">

                    <h3 className="text-sm font-bold uppercase border-b pb-2 mb-4">
                        <FontAwesomeIcon
                            icon={faBuilding}
                            className="mr-2 text-slate-500"
                        />
                        Destination Orphanage
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <input
                            placeholder="Orphanage Name"
                            value={data.orphanagename}
                            onChange={(e) =>
                                setData(
                                    "orphanagename",
                                    e.target.value
                                )
                            }
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Person In Charge"
                            value={data.personincharge}
                            onChange={(e) =>
                                setData(
                                    "personincharge",
                                    e.target.value
                                )
                            }
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Position"
                            value={data.position}
                            onChange={(e) =>
                                setData(
                                    "position",
                                    e.target.value
                                )
                            }
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Institution"
                            value={data.institution}
                            onChange={(e) =>
                                setData(
                                    "institution",
                                    e.target.value
                                )
                            }
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Contact"
                            value={data.contact}
                            onChange={(e) =>
                                setData(
                                    "contact",
                                    e.target.value
                                )
                            }
                            className="rounded-md border-slate-300"
                        />

                    </div>

                </div>

            )}

            {/* Parent */}

            {selectedType?.orphanagetoadoptiveparent == 1 && (

                <div className="p-4 bg-white border rounded-lg shadow-sm">

                    <h3 className="text-sm font-bold uppercase border-b pb-2 mb-4">
                        <FontAwesomeIcon
                            icon={faUsers}
                            className="mr-2 text-slate-500"
                        />
                        Adoptive Parent Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <input
                            placeholder="Adoptive Father"
                            value={data.adoptivefather}
                            onChange={(e)=>setData("adoptivefather",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Adoptive Mother"
                            value={data.adoptivemother}
                            onChange={(e)=>setData("adoptivemother",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Marital Status"
                            value={data.maritalstatus}
                            onChange={(e)=>setData("maritalstatus",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Profession"
                            value={data.profession}
                            onChange={(e)=>setData("profession",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            type="number"
                            placeholder="Blood Children"
                            value={data.numberofbloodchildren}
                            onChange={(e)=>setData("numberofbloodchildren",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            type="number"
                            placeholder="Adopted Children"
                            value={data.numberofadoptedchildren}
                            onChange={(e)=>setData("numberofadoptedchildren",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Physical Address"
                            value={data.physicaladdress}
                            onChange={(e)=>setData("physicaladdress",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                        <input
                            placeholder="Contact"
                            value={data.contact}
                            onChange={(e)=>setData("contact",e.target.value)}
                            className="rounded-md border-slate-300"
                        />

                    </div>

                </div>
            )}

            <div className="flex justify-end gap-4">

                <Link
                    href={route(
                        "orphanage1.index"
                    )}
                    className="px-4 py-2 text-slate-600"
                >
                    Cancel
                </Link>

                <button
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
                >
                    {processing
                        ? <FontAwesomeIcon icon={faSpinner} spin />
                        : <FontAwesomeIcon icon={faSave} />
                    }

                    Save Adoption
                </button>

            </div>

        </form>
    );
}