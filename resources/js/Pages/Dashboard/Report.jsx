import AuthenticatedLayout from '@/Layouts/ReportLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faFileInvoiceDollar,
    faFileMedical,
    faBoxesPacking,
    faUsersViewfinder,
    faChartPie,
    faArrowRight,
    faFileExcel,
    faCashRegister,
    faSyringe,
    faBedPulse
} from '@fortawesome/free-solid-svg-icons';
import usePermissionsStore from '@/stores/usePermissionsStore';

// Reusable Summary Card Component
function ReportCard({ title, description, icon, iconBgColor, linkHref, linkText }) {
    const linkColor = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-indigo-600 dark:text-indigo-400';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col">
            <div className="flex items-start">
                <div className={`p-3 ${iconBgColor || 'bg-gray-500'} rounded-lg shadow-sm flex-shrink-0`}>
                    <FontAwesomeIcon icon={icon} className="text-white h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Link href={linkHref} className={`${linkColor} hover:underline text-sm font-semibold flex items-center group`}>
                    {linkText || 'View Reports'}
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}

export default function ReportsIndex({ auth }) {
    const { modules } = usePermissionsStore();

    // Route placeholders (Update these with your actual report routes)
    const urls = {
        // Financial
        financeSummary: '/reports/financial/summary',
        cashCollection: '/reports/financial/collections',
        insurance: '/reports/financial/insurance',

        // Clinical
        hmis: '/reports/clinical/hmis',
        morbidity: '/reports/clinical/morbidity',
        patientAttendance: '/reports/clinical/attendance',

        // Inventory
        stockLevels: '/reports/inventory/stock',
        drugConsumption: '/reports/inventory/consumption',
        expiries: '/reports/inventory/expiries',

        // Operational
        hrStats: '/reports/operational/staff',
        auditLogs: '/reports/operational/audit'
    };

    // Verify access to reporting module
    if (!modules.some(m => m.modulekey === 'reporting')) {
        return (
            <AuthenticatedLayout user={auth.user}>
                 <div className="p-12 text-center text-gray-500">
                    You do not have permission to view reports.
                 </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Reporting & Analytics
                </h2>
            }
        >
            <Head title="Reports Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Navigation Back */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg">Centralized Reports</h3>
                            <p className="text-sm text-gray-500">Select a category to generate detailed insights.</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>

                    {/* --- FINANCIAL REPORTS --- */}
                    <section>
                        <div className="flex items-center mb-4">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Financial Reports</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReportCard
                                title="Revenue & Income"
                                description="P&L, General Ledger summaries, and revenue by department."
                                icon={faChartLine}
                                iconBgColor="bg-blue-600"
                                linkHref={urls.financeSummary}
                                linkText="Revenue Analytics"
                            />
                            <ReportCard
                                title="Daily Collections"
                                description="Cashier shifts, detailed cash/bank receipts, and shifts."
                                icon={faCashRegister}
                                iconBgColor="bg-blue-500"
                                linkHref={urls.cashCollection}
                                linkText="Cashier Reports"
                            />
                            <ReportCard
                                title="Insurance Claims"
                                description="Claim status, pending bills, and insurance reconciliations."
                                icon={faFileExcel}
                                iconBgColor="bg-sky-600"
                                linkHref={urls.insurance}
                                linkText="Claims Data"
                            />
                        </div>
                    </section>

                    {/* --- CLINICAL REPORTS --- */}
                    <section>
                        <div className="flex items-center mb-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faFileMedical} />
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Clinical & Patient Data</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReportCard
                                title="HMIS & Stats"
                                description="Ministry of Health standard reports (MTUHA) and aggregates."
                                icon={faChartPie}
                                iconBgColor="bg-emerald-600"
                                linkHref={urls.hmis}
                                linkText="HMIS Aggregates"
                            />
                            <ReportCard
                                title="Disease Surveillance"
                                description="Top 10 diseases, morbidity/mortality rates (IPD/OPD)."
                                icon={faBedPulse}
                                iconBgColor="bg-teal-600"
                                linkHref={urls.morbidity}
                                linkText="Morbidity Reports"
                            />
                            <ReportCard
                                title="Patient Attendance"
                                description="Visits by clinic, doctor workload, and queue times."
                                icon={faUsersViewfinder}
                                iconBgColor="bg-green-600"
                                linkHref={urls.patientAttendance}
                                linkText="View Attendance"
                            />
                        </div>
                    </section>

                    {/* --- INVENTORY & OPERATIONS --- */}
                    <section>
                        <div className="flex items-center mb-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <span className="bg-amber-100 text-amber-600 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faBoxesPacking} />
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Inventory & Operations</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReportCard
                                title="Stock Valuation"
                                description="Current stock value, reorder levels, and slow-moving items."
                                icon={faBoxesPacking}
                                iconBgColor="bg-amber-600"
                                linkHref={urls.stockLevels}
                                linkText="Inventory Reports"
                            />
                            <ReportCard
                                title="Drug Consumption"
                                description="Usage by department, expiry tracking, and dispensing logs."
                                icon={faSyringe}
                                iconBgColor="bg-orange-600"
                                linkHref={urls.drugConsumption}
                                linkText="Consumption Data"
                            />
                            <ReportCard
                                title="Staff Activity"
                                description="User login history, action logs, and system audit trails."
                                icon={faUsersViewfinder}
                                iconBgColor="bg-slate-600"
                                linkHref={urls.auditLogs}
                                linkText="Audit Logs"
                            />
                        </div>
                    </section>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}