import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBaby,
    faSyringe,
    faFemale,
    faHeartbeat,
    faChartLine,
    faBoxes,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

function ReportCard({ title, value, description, icon, iconBgColor, linkHref, linkText }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <Link href={linkHref || '#'} className="block group flex-grow flex flex-col">
                <div className="flex items-start mb-auto">
                    <div className={`p-3.5 ${iconBgColor || 'bg-indigo-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                        {value !== undefined && (
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</h3>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-sm font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center">
                        {linkText}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3" />
                    </span>
                </div>
            </Link>
        </div>
    );
}

export default function RchReportsDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">RCH Reporting Hub</h2>}>
            <Head title="RCH Reports" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        
                        {/* 1. Maternity & ANC */}
                        <ReportCard
                            title="Maternity & ANC"
                            value={stats?.active_pregnancies || 0}
                            description="Active pregnancies currently registered."
                            icon={faFemale}
                            iconBgColor="bg-pink-500"
                            linkHref={route('reports.rch.anc')}
                            linkText="View ANC Report"
                        />
                        
                        {/* 2. Deliveries */}
                        <ReportCard
                            title="Deliveries"
                            value={stats?.deliveries_month || 0}
                            description="Babies delivered this month."
                            icon={faBaby}
                            iconBgColor="bg-blue-500"
                            linkHref={route('reports.rch.deliveries')}
                            linkText="View Delivery Logs"
                        />

                        {/* 3. Immunizations */}
                        <ReportCard
                            title="Immunizations"
                            value={stats?.vaccines_today || 0}
                            description="Vaccines administered today."
                            icon={faSyringe}
                            iconBgColor="bg-green-500"
                            linkHref={route('reports.rch.immunizations')}
                            linkText="View Vaccine Summary"
                        />

                        {/* 4. Family Planning */}
                        <ReportCard
                            title="Family Planning"
                            value={stats?.fp_visits_month || 0}
                            description="FP clients served this month."
                            icon={faHeartbeat}
                            iconBgColor="bg-purple-500"
                            linkHref="#" // Update link later when route is ready
                            linkText="View FP Report"
                        />

                        {/* 5. Child Growth */}
                        <ReportCard
                            title="Child Growth"
                            value={stats?.growth_checks_today || 0}
                            description="Growth assessments done today."
                            icon={faChartLine}
                            iconBgColor="bg-orange-500"
                            linkHref={route('reports.rch.child_growth')} 
                            linkText="View Growth Report"
                        />

                        {/* 6. Stock On Hand */}
                        <ReportCard
                            title="Stock On Hand"
                            description="Check current inventory for vaccines, FP methods, and medical supplies."
                            icon={faBoxes}
                            iconBgColor="bg-teal-600"
                            linkHref={route('reports.rch.stock_on_hand')}
                            linkText="View Stock Balances"
                        />
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}