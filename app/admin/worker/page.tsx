"use client"

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerData {
    id: string;
    name: string;
    phone_number: string;
    created_at: string;
    user_addresses: {
        id: string;
        full_address: string;
    }[];
    worker_profile:{
        driving_license :string;
        vehicle_number: string;
        vehicle_rc :string;
    };
}

interface MetaData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminConsumerPage() {
    const [workers, setWorkers] = useState<WorkerData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, limit: 10, totalPages: 1 });

    // Fetch data whenever page or pageSize changes
    useEffect(() => {
        const fetchConsumers = async () => {
            setLoading(true);
            try {
                // Use dynamic state values for the API call
                const res = await fetch(`/api/admin/worker?page=${page}&limit=${pageSize}`);
                if (res.ok) {
                    const json = await res.json();
                    setWorkers(json.data);
                    setMeta(json.meta); // Store the pagination info from the backend
                }
            } catch (error) {
                console.error("Failed to fetch workers");
            } finally {
                setLoading(false);
            }
        };

        fetchConsumers();
    }, [page, pageSize]); // <-- Dependency array ensures auto-refetch

    // Handlers
    const handleNextPage = () => {
        if (page < meta.totalPages) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value));
        setPage(1); // Reset to page 1 when changing size to avoid empty views
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
                {/* Optional: Add a total count badge */}
                <span className="text-sm text-muted-foreground">Total: {meta.total}</span>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Primary Address</TableHead>
                            <TableHead>Driving License</TableHead>
                            <TableHead>Vehicle Number</TableHead>
                            <TableHead>Vehicle RC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : workers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No workers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">{worker.name}</TableCell>
                                    <TableCell>{worker.phone_number}</TableCell>
                                    <TableCell>
                                        {new Date(worker.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[200px]">
                                        {worker.user_addresses?.[0]?.full_address || 
                                            <span className="text-muted-foreground italic">No address</span>}
                                    </TableCell>
                                    <TableCell>{worker.worker_profile?.driving_license || <span className="text-muted-foreground italic">No License</span>}</TableCell>
                                    <TableCell>{worker.worker_profile?.vehicle_number || <span className="text-muted-foreground italic">No Vehicle Number</span>}</TableCell>
                                    <TableCell>{worker.worker_profile?.vehicle_rc || <span className="text-muted-foreground italic">No Vehicle RC</span>}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- Pagination Controls --- */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select 
                        value={pageSize.toString()} 
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {meta.page} of {meta.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handlePrevPage}
                        disabled={page <= 1 || loading}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handleNextPage}
                        disabled={page >= meta.totalPages || loading}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}