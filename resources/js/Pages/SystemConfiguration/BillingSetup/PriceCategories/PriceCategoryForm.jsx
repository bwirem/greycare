import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function PriceCategoryForm({ pricecategory = null }) {

    // Generate default form data dynamically
    const generateInitialData = () => {
        const formData = {};

        for (let i = 1; i <= 15; i++) {
            formData[`price${i}`] =
                pricecategory?.[`price${i}`] || `Price Level ${i}`;

            formData[`useprice${i}`] =
                pricecategory
                    ? Boolean(pricecategory?.[`useprice${i}`])
                    : i === 1;
        }

        return formData;
    };

    const { data, setData, put, post, processing, errors, reset } = useForm(
        generateInitialData()
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        if (pricecategory) {
            put(route('systemconfiguration0.pricecategories.update', pricecategory.id), {
                preserveScroll: true,
            });
        } else {
            post(route('systemconfiguration0.pricecategories.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const renderPriceInput = (index) => (
        <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-md"
        >
            <div className="md:col-span-2">
                <label
                    htmlFor={`price${index}`}
                    className="block text-sm font-medium text-gray-700"
                >
                    Price Level {index} Name*
                </label>

                <input
                    id={`price${index}`}
                    type="text"
                    value={data[`price${index}`]}
                    onChange={(e) =>
                        setData(`price${index}`, e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />

                {errors[`price${index}`] && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors[`price${index}`]}
                    </p>
                )}
            </div>

            <div className="flex items-center pt-6">
                <input
                    id={`useprice${index}`}
                    type="checkbox"
                    checked={data[`useprice${index}`]}
                    onChange={(e) =>
                        setData(`useprice${index}`, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />

                <label
                    htmlFor={`useprice${index}`}
                    className="ml-2 block text-sm text-gray-900"
                >
                    Enable
                </label>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="flex items-center gap-2 border-b pb-3">
                <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                    Price Categories
                </h2>
            </div>

            <div className="space-y-4">
                {Array.from({ length: 15 }, (_, i) => i + 1).map(renderPriceInput)}
            </div>

            <div className="flex justify-end items-center gap-4 pt-4 border-t">
                <Link
                    href={route('systemconfiguration0.pricecategories.index')}
                    className="text-gray-700 font-medium"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md flex items-center gap-2 disabled:bg-blue-300"
                >
                    {processing
                        ? <FontAwesomeIcon icon={faSpinner} spin />
                        : <FontAwesomeIcon icon={faSave} />
                    }

                    {pricecategory
                        ? 'Update Categories'
                        : 'Save Categories'}
                </button>
            </div>
        </form>
    );
}