import React from "react";
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPercent,
    faShieldAlt,
    faHandHoldingMedical,
    faHandHoldingUsd,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export default function PayrollSetupIndex({ auth, taxCount, ssCount, insCount, finCount }) {
    
    const cards = [
        { title: "Tax Brackets (PAYE)", count: taxCount, icon: faPercent, route: 'systemconfiguration12.tax.index', color: 'red', desc: "Configure tax bands and rates." },
        { title: "Social Security", count: ssCount, icon: faShieldAlt, route: 'systemconfiguration12.social.index', color: 'indigo', desc: "NSSF and statutory deductions." },
        { title: "Insurance Types", count: insCount, icon: faHandHoldingMedical, route: 'systemconfiguration12.insurance.index', color: 'teal', desc: "Health and Life insurance providers." },
        { title: "Financiers", count: finCount, icon: faHandHoldingUsd, route: 'systemconfiguration12.financiers.index', color: 'orange', desc: "Banks/Saccos for loans." },
    ];

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Payroll Configuration</h2>}>
            <Head title="Payroll Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        Manage <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
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