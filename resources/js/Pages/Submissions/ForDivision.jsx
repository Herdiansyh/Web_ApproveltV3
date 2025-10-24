import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";

export default function ForDivision({ auth, submissions }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Pengajuan Masuk ke Divisi Saya
                </h2>
            }
        >
            <Head title="Pengajuan Masuk" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full overflow-auto">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left">
                                                Judul
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                Pengirim
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {submissions.data.map((submission) => (
                                            <tr key={submission.id}>
                                                <td className="px-6 py-4">
                                                    {submission.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {submission.user.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {submission.status}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(
                                                        submission.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={route(
                                                            "submissions.show",
                                                            submission.id
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="mt-6">
                                    {submissions.links &&
                                        submissions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || "#"}
                                                className={`px-3 py-1 mx-1 ${
                                                    link.active
                                                        ? "bg-blue-500 text-white"
                                                        : "text-gray-600 hover:text-blue-500"
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
