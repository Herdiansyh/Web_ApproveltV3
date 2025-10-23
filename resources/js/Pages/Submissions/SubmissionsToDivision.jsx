import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import Sidebar from "@/Components/Sidebar";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import Swal from "sweetalert2";

export default function SubmissionsToDivision({ auth, submissions }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const { data, setData, post, processing, reset } = useForm({
        approval_note: "",
    });

    const openApproveModal = (submission) => {
        setSelectedSubmission(submission);
        setShowApproveModal(true);
    };

    const openRejectModal = (submission) => {
        setSelectedSubmission(submission);
        setShowRejectModal(true);
    };

    const handleApprove = () => {
        post(route("submissions.approve", selectedSubmission.id), {
            ...data,
            onSuccess: () => {
                setShowApproveModal(false);
                reset();
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Dokumen telah disetujui",
                    confirmButtonText: "OK",
                }).then(() => {
                    window.location.reload();
                });
            },
        });
    };

    const handleReject = () => {
        if (!data.approval_note.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Perhatian",
                text: "Mohon berikan alasan penolakan",
                confirmButtonText: "OK",
            });
            return;
        }

        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Dokumen akan ditolak!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, tolak",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                post(route("submissions.reject", selectedSubmission.id), {
                    onSuccess: () => {
                        setShowRejectModal(false);
                        reset();
                        Swal.fire({
                            icon: "success",
                            title: "Berhasil",
                            text: "Dokumen telah ditolak",
                            confirmButtonText: "OK",
                        }).then(() => {
                            window.location.reload();
                        });
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Pengajuan untuk Divisi {auth.user.division.name}
                </h2>
            }
        >
            <Head title="Pengajuan Divisi" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />

                <div className="py-12 w-[100%] overflow-auto">
                    <div className="mx-auto sm:px-6 px-8 lg:px-8 overflow-x-auto">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-3 text-left">
                                                    Judul
                                                </th>
                                                <th className="px-6 py-3 text-left">
                                                    Dari Divisi
                                                </th>
                                                <th className="px-6 py-3 text-left">
                                                    Diajukan Oleh
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
                                            {submissions.data.map(
                                                (submission) => (
                                                    <tr
                                                        key={submission.id}
                                                        className={
                                                            submission.status ===
                                                            "pending"
                                                                ? "bg-yellow-50"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="px-6 py-4">
                                                            {submission.title}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {submission
                                                                .division_from
                                                                ?.name || "-"}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {
                                                                submission.user
                                                                    .name
                                                            }
                                                        </td>
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
                                                                    Lihat
                                                                </Link>
                                                                {submission.status ===
                                                                    "pending" &&
                                                                    auth.user
                                                                        .role ===
                                                                        "employee" && (
                                                                        <>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    openRejectModal(
                                                                                        submission
                                                                                    )
                                                                                }
                                                                                className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700"
                                                                            >
                                                                                Tolak
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    openApproveModal(
                                                                                        submission
                                                                                    )
                                                                                }
                                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                            >
                                                                                Setujui
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
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

                {/* Approve Modal */}
                {showApproveModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Setujui Pengajuan
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Catatan (Opsional)
                                </label>
                                <Textarea
                                    value={data.approval_note}
                                    onChange={(e) =>
                                        setData("approval_note", e.target.value)
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowApproveModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    Setujui
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Tolak Pengajuan
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Alasan Penolakan
                                </label>
                                <Textarea
                                    value={data.approval_note}
                                    onChange={(e) =>
                                        setData("approval_note", e.target.value)
                                    }
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={processing}
                                >
                                    Tolak
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
