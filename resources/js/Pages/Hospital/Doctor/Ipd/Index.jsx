import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFilter,
    faProcedures,
    faUserInjured,
    faSearch
} from '@fortawesome/free-solid-svg-icons';

export default function DoctorIpdIndex({ admissions, wards, filters }) {

    const [selectedWard, setSelectedWard] = useState(() => {
        if (filters.ward_id) return filters.ward_id;

        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('doctor_ipd_ward_filter') || '';
        }

        return '';
    });

    const [search, setSearch] = useState(filters.search || '');

    const isFirstRender = useRef(true);

    const loadPatients = (ward = selectedWard, patientSearch = search) => {
        router.get(
            route(route().current()),
            {
                ward_id: ward,
                search: patientSearch,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    useEffect(() => {

        sessionStorage.setItem(
            'doctor_ipd_ward_filter',
            selectedWard
        );

        if (isFirstRender.current) {
            isFirstRender.current = false;

            if (selectedWard && !filters.ward_id) {
                loadPatients(selectedWard, search);
            }

            return;
        }

        loadPatients();

    }, [selectedWard]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadPatients();
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedWard('');

        sessionStorage.removeItem('doctor_ipd_ward_filter');

        router.get(
            route(route().current()),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faProcedures}
                        className="text-blue-600"
                    />
                    Inpatient Ward Rounds
                </h2>
            }
        >
            <Head title="Ward Rounds" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="md:col-span-1"
                        >
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="mr-1"
                                />
                                Search Patient
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Patient name or code..."
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                />

                                <button
                                    type="submit"
                                    className="px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Ward Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    className="mr-1"
                                />
                                Filter by Ward
                            </label>

                            <select
                                value={selectedWard}
                                onChange={(e) =>
                                    setSelectedWard(e.target.value)
                                }
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            >
                                <option value="">
                                    Show All Wards
                                </option>

                                {wards.map((ward) => (
                                    <option
                                        key={ward.id}
                                        value={ward.id}
                                    >
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="flex items-end justify-between gap-2">

                            <div className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-full border">
                                Total Patients:{' '}
                                <span className="text-indigo-600 font-bold">
                                    {admissions.total}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                Clear
                            </button>

                        </div>

                    </div>
                </div>

                {/* PATIENTS */}
                {admissions.data.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">

                        <FontAwesomeIcon
                            icon={faUserInjured}
                            className="text-gray-300 text-4xl mb-3"
                        />

                        <p className="text-gray-500 text-lg">
                            No admitted patients found.
                        </p>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {admissions.data.map((adm) => (

                            <div
                                key={adm.id}
                                className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-5">

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {adm.patient?.first_name}{' '}
                                                {adm.patient?.last_name}
                                            </h3>

                                            <p className="text-sm text-gray-500 font-mono">
                                                {adm.patientcode}
                                            </p>
                                        </div>

                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-1 rounded font-semibold">
                                            {adm.ward?.name}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">

                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-bold">
                                                Bed No
                                            </span>

                                            <span className="font-medium text-gray-800">
                                                {adm.bed?.name || 'Unassigned'}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="block text-gray-400 text-xs uppercase font-bold">
                                                Admitted
                                            </span>

                                            <span className="font-medium text-gray-800">
                                                {new Date(
                                                    adm.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                    </div>

                                    <div className="mt-5 flex justify-end">

                                        <Link
                                            href={route(
                                                'doctor1.create',
                                                adm.id
                                            )}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-bold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition ease-in-out duration-150"
                                        >
                                            Conduct Round
                                        </Link>

                                    </div>

                                </div>
                            </div>

                        ))}

                    </div>
                )}

                <div className="mt-6">
                    {admissions.links && (
                        <Pagination links={admissions.links} />
                    )}
                </div>

            </div>
        </HospitalLayout>
    );
}