import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faFileInvoiceDollar, faChartLine, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const SummaryCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <div className="flex items-center">
            <div className={`p-3 rounded-lg ${color} text-white`}>
                <FontAwesomeIcon icon={icon} className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

export default function Finance({ auth, stats }) {
    // stats prop comes from controller (financeStats method)
    const { salesTodayCount = 0, salesTodayValue = 0 } = stats || {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Sales & Finance</h2>}>
            <Head title="Finance Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link href={route('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Main Menu</Link>
                        <Link href={route('billing.index')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go to Billing Hub</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <SummaryCard 
                            title="Sales Count (Today)" 
                            value={salesTodayCount} 
                            icon={faCashRegister} 
                            color="bg-indigo-600"
                        />
                        <SummaryCard 
                            title="Sales Value (Today)" 
                            value={formatCurrency(salesTodayValue)} 
                            icon={faChartLine} 
                            color="bg-emerald-600"
                            subtext="Total Paid"
                        />
                        <SummaryCard 
                            title="Pending Invoices" 
                            value="-" 
                            icon={faFileInvoiceDollar} 
                            color="bg-orange-500"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}