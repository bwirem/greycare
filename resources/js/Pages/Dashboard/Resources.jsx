import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faTruck, faWarehouse, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const ResourceCard = ({ title, value, icon, color, alert }) => (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl p-6 border-l-4 ${alert ? 'border-red-500' : 'border-transparent'}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${color} text-white bg-opacity-90`}>
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
            </div>
        </div>
    </div>
);

export default function Resources({ auth, stats }) {
    const { pendingPOCount = 0, lowStockItemCount = 0, totalStockValue = 0, activeSuppliersCount = 0 } = stats || {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Resources & Assets</h2>}>
            <Head title="Resources Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link href={route('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Main Menu</Link>
                        <div className="space-x-4">
                             <Link href={route('inventory.index')} className="text-sm text-indigo-600 hover:underline">Inventory Hub</Link>
                             <Link href={route('procurement.index')} className="text-sm text-indigo-600 hover:underline">Procurement Hub</Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <ResourceCard 
                            title="Low Stock Items" 
                            value={lowStockItemCount} 
                            icon={faTriangleExclamation} 
                            color="bg-red-500" 
                            alert={lowStockItemCount > 0}
                        />
                        <ResourceCard 
                            title="Pending POs" 
                            value={pendingPOCount} 
                            icon={faTruck} 
                            color="bg-amber-500" 
                        />
                         <ResourceCard 
                            title="Stock Value" 
                            value={formatCurrency(totalStockValue)} 
                            icon={faBoxes} 
                            color="bg-blue-600" 
                        />
                        <ResourceCard 
                            title="Active Suppliers" 
                            value={activeSuppliersCount} 
                            icon={faWarehouse} 
                            color="bg-slate-600" 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}