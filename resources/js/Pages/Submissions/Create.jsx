import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/Components/ui/select";
import Sidebar from "@/Components/Sidebar";
import Swal from "sweetalert2";

export default function Create({ auth, divisions, userDivision }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        file: null,
        steps: [{ division_id: "" }], // langkah pertama wajib diisi
    });

    const handleAddStep = () => {
        setData("steps", [...data.steps, { division_id: "" }]);
    };

    const handleRemoveStep = (index) => {
        const updatedSteps = [...data.steps];
        updatedSteps.splice(index, 1);
        setData("steps", updatedSteps);
    };

    const handleStepChange = (index, value) => {
        const updatedSteps = [...data.steps];
        updatedSteps[index].division_id = value;
        setData("steps", updatedSteps);
    };

    const handleFileChange = (e) => {
        setData("file", e.target.files[0]);
    };

    const submit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: "Kirim Pengajuan?",
            text: "Pastikan data sudah benar sebelum dikirim.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Kirim",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                post(route("submissions.store"), {
                    onSuccess: () => {
                        reset();
                        Swal.fire({
                            icon: "success",
                            title: "Berhasil!",
                            text: "Pengajuan berhasil dikirim.",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: "error",
                            title: "Gagal",
                            text: "Terjadi kesalahan saat mengirim pengajuan.",
                        });
                    },
                });
            }
        });
    };

    // Hilangkan divisi sendiri dari daftar tujuan
    const availableDivisions = divisions.filter(
        (div) => div.id !== userDivision?.id
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Buat Pengajuan Baru
                </h2>
            }
        >
            <Head title="Buat Pengajuan" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <Card className="p-6 shadow-md">
                            <form onSubmit={submit}>
                                <div className="space-y-6">
                                    {/* Judul */}
                                    <div>
                                        <Label>Judul Pengajuan</Label>
                                        <Input
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-red-600 text-sm">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Deskripsi */}
                                    <div>
                                        <Label>Deskripsi (Opsional)</Label>
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            rows={4}
                                        />
                                    </div>

                                    {/* Divisi Asal */}
                                    <div>
                                        <Label>Dari Divisi</Label>
                                        <Input
                                            value={userDivision?.name || "-"}
                                            disabled
                                        />
                                    </div>

                                    {/* Workflow Steps */}
                                    <div>
                                        <Label>Tujuan Workflow</Label>
                                        {data.steps.map((step, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 mt-2"
                                            >
                                                <Select
                                                    value={step.division_id}
                                                    onValueChange={(value) =>
                                                        handleStepChange(
                                                            index,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih divisi tujuan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableDivisions.map(
                                                            (div) => (
                                                                <SelectItem
                                                                    key={div.id}
                                                                    value={div.id.toString()}
                                                                >
                                                                    {div.name}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleRemoveStep(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="mt-3"
                                            onClick={handleAddStep}
                                        >
                                            + Tambah Workflow
                                        </Button>

                                        {errors.steps && (
                                            <p className="text-red-600 mt-1 text-sm">
                                                {errors.steps}
                                            </p>
                                        )}
                                    </div>

                                    {/* Upload File */}
                                    <div>
                                        <Label>Dokumen</Label>
                                        <Input
                                            type="file"
                                            onChange={handleFileChange}
                                            required
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Format: PDF, JPG, PNG (maks. 10MB)
                                        </p>
                                    </div>

                                    {/* Tombol Kirim */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Mengirim..."
                                                : "Kirim Pengajuan"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
