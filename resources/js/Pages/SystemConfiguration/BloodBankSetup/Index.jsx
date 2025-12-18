import React from "react";
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTint, faBan, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function BloodBankSetupIndex({ auth, counts }) {
    const items = [
        { 
            title: "Blood Components", 
            count: counts.components || 0,
            icon: faTint, 
            routeName: 'systemconfiguration10.components.index', 
            color: 'red', 
            desc: "Manage Whole Blood, Plasma, Platelets and their shelf life." 
        },
        { 
            title: "Deferral Reasons", 
            count: counts.deferrals || 0,
            icon: faBan, 
            routeName: 'systemconfiguration10.deferrals.index', 
            color: 'orange', 
            desc: "Manage reasons for donor rejection (Low HB, Illness)." 
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Blood Bank Configuration</h2>}>
            <Head title="Blood Bank Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item, idx) => (
                            <Link key={idx} href={route(item.routeName)} className={`block bg-white shadow-sm rounded-lg p-6 border-l-4 border-${item.color}-500 hover:shadow-lg`}>
                                <div className="flex items-center mb-4">
                                    <div className={`p-3 rounded-md bg-${item.color}-100 text-${item.color}-600 mr-4`}>
                                        <FontAwesomeIcon icon={item.icon} size="lg" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                        <p className="text-2xl font-bold text-gray-700">{item.count}</p>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
                                <div className={`text-${item.color}-600 text-sm font-semibold flex items-center`}>
                                    Manage <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}