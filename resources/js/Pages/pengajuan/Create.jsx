import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ auth, divisions }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        division_id: "",
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("pengajuan.store"), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Buat Pengajuan Baru
                </h2>
            }
        >
            <Head title="Buat Pengajuan" />

            <div className="flex justify-center py-12 bg-gray-50 min-h-screen">
                <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-800">
                            Form Pengajuan
                        </CardTitle>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            {/* Judul */}
                            <div>
                                <Label htmlFor="title">Judul Pengajuan</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                    placeholder="Contoh: Permintaan pembelian alat tulis"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Tuliskan detail alasan atau kebutuhan pengajuan..."
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Divisi */}
                            <div>
                                <Label htmlFor="division">Divisi</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData("division_id", value)
                                    }
                                    value={data.division_id}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Divisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {divisions.map((division) => (
                                            <SelectItem
                                                key={division.id}
                                                value={division.id.toString()}
                                            >
                                                {division.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.division_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.division_id}
                                    </p>
                                )}
                            </div>

                            {/* Upload File */}
                            <div>
                                <Label htmlFor="file">File Pengajuan</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) =>
                                        setData("file", e.target.files[0])
                                    }
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                />
                                {errors.file && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.file}
                                    </p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processing ? "Mengirim..." : "Kirim Pengajuan"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
