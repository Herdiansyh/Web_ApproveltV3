import React from "react";
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
        to_division_id: "",
    });

    const submit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: "Konfirmasi",
            text: "Apakah Anda yakin ingin mengirim pengajuan ini?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, kirim",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                post(route("submissions.store"), {
                    onSuccess: () => {
                        reset();
                        Swal.fire({
                            icon: "success",
                            title: "Berhasil",
                            text: "Pengajuan Anda telah berhasil dikirim!",
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

    const handleFileChange = (e) => {
        setData("file", e.target.files[0]);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Buat Pengajuan Baru
                </h2>
            }
        >
            <Head title="Buat Pengajuan" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <Card className="p-6">
                            <form onSubmit={submit}>
                                <div className="space-y-6">
                                    {/* Judul */}
                                    <div>
                                        <Label htmlFor="title">
                                            Judul Pengajuan
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Deskripsi */}
                                    <div>
                                        <Label htmlFor="description">
                                            Deskripsi (Opsional)
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            rows={4}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Dari Divisi (readonly info) */}
                                    <div>
                                        <Label>Dari Divisi</Label>
                                        <Input
                                            value={userDivision.name}
                                            disabled
                                        />
                                    </div>

                                    {/* Ke Divisi */}
                                    <div>
                                        <Label htmlFor="to_division_id">
                                            Ke Divisi Tujuan
                                        </Label>
                                        <Select
                                            value={data.to_division_id}
                                            onValueChange={(value) =>
                                                setData("to_division_id", value)
                                            }
                                        >
                                            <SelectTrigger id="to_division_id">
                                                <SelectValue placeholder="Pilih divisi tujuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {divisions.map((d) => (
                                                    <SelectItem
                                                        key={d.id}
                                                        value={d.id.toString()}
                                                    >
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.to_division_id && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.to_division_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* File */}
                                    <div>
                                        <Label htmlFor="file">Dokumen</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={handleFileChange}
                                            required
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Format: PDF, JPG, PNG (Maks. 10MB)
                                        </p>
                                        {errors.file && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.file}
                                            </p>
                                        )}
                                    </div>

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
