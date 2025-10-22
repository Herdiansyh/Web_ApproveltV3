import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function Index({ auth, submissions, canApprove }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Submissions
                </h2>
            }
        >
            <Head title="Submissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {auth.user.role === "employee" && (
                                <div className="mb-6">
                                    <Link href={route("submissions.create")}>
                                        <PrimaryButton>
                                            Buat Pengajuan Baru
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left">
                                                Judul
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                Divisi
                                            </th>
                                            {auth.user.role === "manager" && (
                                                <th className="px-6 py-3 text-left">
                                                    Diajukan Oleh
                                                </th>
                                            )}
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
                                            <tr
                                                key={submission.id}
                                                className={
                                                    submission.status ===
                                                        "pending" &&
                                                    auth.user.role === "manager"
                                                        ? "bg-yellow-50"
                                                        : ""
                                                }
                                            >
                                                <td className="px-6 py-4">
                                                    {submission.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {submission.division.name}
                                                </td>
                                                {auth.user.role ===
                                                    "manager" && (
                                                    <td className="px-6 py-4">
                                                        {submission.user.name}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            submission.status ===
                                                            "approved"
                                                                ? "bg-green-100 text-green-800"
                                                                : submission.status ===
                                                                  "rejected"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {submission.status ===
                                                        "pending"
                                                            ? "Menunggu Persetujuan"
                                                            : submission.status ===
                                                              "approved"
                                                            ? "Disetujui"
                                                            : "Ditolak"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(
                                                        submission.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <Link
                                                            href={route(
                                                                "submissions.show",
                                                                submission.id
                                                            )}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            {auth.user.role ===
                                                                "manager" &&
                                                            submission.status ===
                                                                "pending"
                                                                ? "Review"
                                                                : "Lihat"}
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

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
        </AuthenticatedLayout>
    );
}
