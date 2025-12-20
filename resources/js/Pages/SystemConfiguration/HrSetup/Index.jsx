import React from "react";
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding,
    faUserTie,
    faUniversity,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export default function HrSetupIndex({ auth, deptCount, posCount, bankCount }) {
    
    const cards = [
        { title: "Departments", count: deptCount, icon: faBuilding, route: 'systemconfiguration11.departments.index', color: 'blue', desc: "Manage organizational units." },
        { title: "Positions", count: posCount, icon: faUserTie, route: 'systemconfiguration11.positions.index', color: 'green', desc: "Manage job titles and roles." },
        { title: "Banks", count: bankCount, icon: faUniversity, route: 'systemconfiguration11.banks.index', color: 'purple', desc: "Manage bank list for direct deposits." },
    ];

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">HR Organization Setup</h2>}>
            <Head title="HR Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((item, idx) => (
                            <Link key={idx} href={route(item.route)} className={`block bg-white shadow-sm sm:rounded-lg hover:shadow-lg transition group border-l-4 border-${item.color}-500`}>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-md bg-${item.color}-500 text-white`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-6 w-6" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                            <p className="text-2xl font-bold text-gray-600">{item.count}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500">{item.desc}</p>
                                    <div className={`mt-4 text-sm font-medium text-${item.color}-600 flex items-center`}>
                                        Configure <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}