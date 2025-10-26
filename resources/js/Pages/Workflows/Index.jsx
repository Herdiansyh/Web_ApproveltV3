import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import Sidebar from "@/Components/Sidebar";
import Swal from "sweetalert2";

export default function Index({ auth, workflows, divisions }) {
    const [showModal, setShowModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);

    // Pastikan workflows selalu array
    const workflowsList = workflows || [];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        description: "",
        steps: [{ division_id: "" }], // default minimal 1 step
    });

    const openCreateModal = () => {
        setEditingWorkflow(null);
        reset();
        setData("steps", [{ division_id: "" }]);
        setShowModal(true);
    };

    const openEditModal = (workflow) => {
        setEditingWorkflow(workflow);
        setData({
            name: workflow.name,
            description: workflow.description || "",
            steps: workflow.steps?.map((s) => ({
                id: s.id,
                division_id: s.division?.id || "",
            })) || [{ division_id: "" }],
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingWorkflow) {
            put(route("workflows.update", editingWorkflow.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingWorkflow(null);
                    reset();
                    Swal.fire({
                        icon: "success",
                        title: "Workflow updated",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
            });
        } else {
            post(route("workflows.store"), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    Swal.fire({
                        icon: "success",
                        title: "Workflow created",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
            });
        }
    };

    const handleDelete = (workflowId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("workflows.destroy", workflowId), {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "Workflow has been deleted.",
                            "success"
                        );
                    },
                });
            }
        });
    };

    const addStep = () =>
        setData("steps", [...data.steps, { division_id: "" }]);
    const removeStep = (index) => {
        const newSteps = data.steps.filter((_, i) => i !== index);
        setData("steps", newSteps);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Workflow Management
                </h2>
            }
        >
            <Head title="Workflow Management" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full overflow-auto">
                    <div className="mx-auto p-6 lg:px-8">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">
                                    Workflows
                                </h3>
                                <Button
                                    onClick={openCreateModal}
                                    style={{ borderRadius: "15px" }}
                                >
                                    Add New Workflow
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Steps</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workflowsList.map((wf) => (
                                        <TableRow key={wf.id}>
                                            <TableCell>{wf.name}</TableCell>
                                            <TableCell>
                                                {wf.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {(
                                                    wf.steps?.map(
                                                        (s) => s.division?.name
                                                    ) || []
                                                ).join(" → ") || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditModal(wf)
                                                        }
                                                        style={{
                                                            borderRadius:
                                                                "15px",
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(wf.id)
                                                        }
                                                        style={{
                                                            borderRadius:
                                                                "15px",
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingWorkflow
                                ? "Edit Workflow"
                                : "Create New Workflow"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Steps</Label>
                                    {data.steps.map((step, index) => (
                                        <div
                                            key={index}
                                            className="flex space-x-2 mb-2 items-center"
                                        >
                                            <Select
                                                value={
                                                    step.division_id?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) => {
                                                    const newSteps = [
                                                        ...data.steps,
                                                    ];
                                                    newSteps[
                                                        index
                                                    ].division_id =
                                                        parseInt(value); // kembalikan ke number
                                                    setData("steps", newSteps);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select division" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {divisions?.map((d) => (
                                                        <SelectItem
                                                            key={d.id}
                                                            value={d.id.toString()}
                                                        >
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    removeStep(index)
                                                }
                                                style={{ borderRadius: "15px" }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addStep}
                                        style={{ borderRadius: "15px" }}
                                    >
                                        Add Step
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingWorkflow(null);
                                        reset();
                                    }}
                                    style={{ borderRadius: "15px" }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    style={{ borderRadius: "15px" }}
                                >
                                    {editingWorkflow ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
