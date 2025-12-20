import React from "react";
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUmbrellaBeach, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, typeCount }) {
    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Leave Configuration</h2>}>
            <Head title="Leave Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Leave Types Card */}
                        <Link href={route('systemconfiguration13.leavetypes.index')} className="block bg-white shadow-sm sm:rounded-lg hover:shadow-lg transition group border-l-4 border-teal-500">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-md bg-teal-500 text-white">
                                        <FontAwesomeIcon icon={faUmbrellaBeach} className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Leave Types</h3>
                                        <p className="text-2xl font-bold text-gray-600">{typeCount}</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-gray-500">Define Annual, Sick, Maternity, and other leave categories.</p>
                                <div className="mt-4 text-sm font-medium text-teal-600 flex items-center">
                                    Manage <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}