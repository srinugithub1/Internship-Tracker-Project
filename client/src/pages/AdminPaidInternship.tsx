import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Upload, Search, FileDown, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminPaidInternship() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newIntern, setNewIntern] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        college: "",
        branch: "",
        semester: "",
        universityName: ""
    });
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({
        name: "",
        email: "",
        phoneNumber: "",
        college: "",
        branch: "",
        semester: "",
        universityName: ""
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: internships = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/paid-internships"],
    });

    const bulkImportMutation = useMutation({
        mutationFn: async (allData: any[]) => {
            const BATCH_SIZE = 100;
            const totalBatches = Math.ceil(allData.length / BATCH_SIZE);
            let results: any[] = [];

            for (let i = 0; i < totalBatches; i++) {
                const batch = allData.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
                const batchResults = await apiRequest("POST", "/api/paid-internships/bulk", batch);
                results = [...results, ...batchResults];
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/paid-internships"] });
            toast({ title: "Import Successful", description: "All records have been imported." });
            setIsImportModalOpen(false);
            setCsvData([]);
            setHeaders([]);
        },
        onError: (err: any) => {
            toast({
                title: "Import Failed",
                description: err.message || "Failed to import records. Please check your data.",
                variant: "destructive"
            });
        }
    });

    const createInternMutation = useMutation({
        mutationFn: (data: any) => apiRequest("POST", "/api/paid-internships", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/paid-internships"] });
            toast({ title: "Intern Added", description: "The intern has been manually added successfully." });
            setIsAddModalOpen(false);
            setNewIntern({
                name: "",
                email: "",
                phoneNumber: "",
                college: "",
                branch: "",
                semester: "",
                universityName: ""
            });
        },
        onError: (err: any) => {
            toast({
                title: "Failed to Add Intern",
                description: err.message || "An error occurred.",
                variant: "destructive"
            });
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n");
            const headerRow = lines[0].split(",").map(h => h.trim());
            const dataRows = lines.slice(1).filter(line => line.trim() !== "").map(line => {
                const values = line.split(",").map(v => v.trim());
                return values;
            });

            setHeaders(headerRow);
            setCsvData(dataRows);

            // Try auto-mapping
            const dbFields = ["name", "email", "phoneNumber", "college", "branch", "semester", "universityName"];
            const newMapping = { ...mapping };
            dbFields.forEach(field => {
                const match = headerRow.find(h => h.toLowerCase().includes(field.toLowerCase()));
                if (match) newMapping[field] = match;
            });
            setMapping(newMapping);
        };
        reader.readAsText(file);
    };

    const processImport = () => {
        const dbReadyData = csvData.map(row => {
            const entry: any = {};
            Object.keys(mapping).forEach(dbField => {
                const headerName = mapping[dbField];
                const headerIndex = headers.indexOf(headerName);
                entry[dbField] = row[headerIndex] || "";
            });
            return entry;
        });

        // Filter out empty rows
        const validData = dbReadyData.filter(d => d.name && d.email);
        if (validData.length === 0) {
            toast({ title: "No valid data", description: "Please map 'name' and 'email' fields.", variant: "destructive" });
            return;
        }

        bulkImportMutation.mutate(validData);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredInternships = internships.filter((intern: any) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.college.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRecords = filteredInternships.length;
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
    const paginatedInternships = filteredInternships.slice(startIndex, endIndex);

    // Reset to page 1 on search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                Paid Internships
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and import paid internship applications.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl font-bold h-11" onClick={() => {
                                const csvContent = "data:text/csv;charset=utf-8," +
                                    ["Name", "Email", "PhoneNumber", "College", "Branch", "Semester", "UniversityName"].join(",") + "\n" +
                                    internships.map((i: any) => [i.name, i.email, i.phoneNumber, i.college, i.branch, i.semester, i.universityName].join(",")).join("\n");
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", "paid_internships.csv");
                                document.body.appendChild(link);
                                link.click();
                            }}>
                                <FileDown className="h-4 w-4 mr-2" /> Export CSV
                            </Button>
                            <Button className="rounded-xl font-black h-11 shadow-lg shadow-primary/20" onClick={() => setIsImportModalOpen(true)}>
                                <Upload className="h-4 w-4 mr-2" /> Import Data
                            </Button>
                        </div>
                    </header>

                    <Card className="glass border-white/20 shadow-xl overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/10 p-6 flex flex-row items-center justify-between gap-4">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email or college..."
                                    className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                                <Button
                                    className="rounded-xl font-black h-10 shadow-lg shadow-primary/20 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Intern
                                </Button>
                                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 ml-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"> Total Records: </span>
                                    <span className="text-sm font-black text-primary">{totalRecords}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/10">
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 px-6">Name</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Email</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Phone</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">College</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Branch</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Semester</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">University</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 animate-pulse font-bold text-muted-foreground uppercase tracking-widest text-xs">Fetching records...</TableCell>
                                        </TableRow>
                                    ) : paginatedInternships.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic border-white/5 bg-white/5">No applications found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedInternships.map((intern: any) => (
                                            <TableRow key={intern.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                <TableCell className="py-4 px-6">
                                                    <p className="font-black text-sm">{intern.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Applied: {new Date(intern.createdAt).toLocaleDateString()}</p>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{intern.email}</TableCell>
                                                <TableCell className="text-sm font-medium">{intern.phoneNumber}</TableCell>
                                                <TableCell className="text-sm font-bold opacity-80">{intern.college}</TableCell>
                                                <TableCell className="text-sm font-medium opacity-80">{intern.branch}</TableCell>
                                                <TableCell className="text-sm font-bold opacity-80">{intern.semester}</TableCell>
                                                <TableCell className="text-sm font-medium opacity-80">{intern.universityName}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {totalRecords > 0 && (
                                <div className="border-t border-white/10 p-4 bg-white/5 flex items-center justify-between gap-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Showing <span className="text-foreground">{startIndex + 1}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{totalRecords}</span> entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg font-bold h-8 border-white/10"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const pageNum = i + 1;
                                                // Show first page, last page, and pages around current page
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            className={cn(
                                                                "h-8 w-8 rounded-lg font-black text-xs",
                                                                currentPage === pageNum ? "shadow-lg shadow-primary/20" : "border-white/10"
                                                            )}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                    return <span key={pageNum} className="text-muted-foreground">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg font-bold h-8 border-white/10"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="max-w-2xl glass border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Bulk Data Import</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file and map your column headers to the database fields.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                            <div className="text-center">
                                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                                <p className="text-sm font-bold">{headers.length > 0 ? "File Selected" : "Click to select CSV file"}</p>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Maximum 3000 rows per batch</p>
                            </div>
                        </div>

                        {headers.length > 0 && (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Field Mapping</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.keys(mapping).map((dbField) => (
                                        <div key={dbField} className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">{dbField}</Label>
                                            <select
                                                className="w-full h-9 bg-transparent text-sm font-bold border-none focus:ring-0 outline-none cursor-pointer"
                                                value={mapping[dbField]}
                                                onChange={(e) => setMapping({ ...mapping, [dbField]: e.target.value })}
                                            >
                                                <option value="" className="bg-background">-- Select Header --</option>
                                                {headers.map(h => (
                                                    <option key={h} value={h} className="bg-background">{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="rounded-xl font-black px-8 shadow-lg shadow-primary/20"
                            disabled={headers.length === 0 || bulkImportMutation.isPending}
                            onClick={processImport}
                        >
                            {bulkImportMutation.isPending ? "Importing..." : "Process Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl glass border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Add New Intern</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new paid internship record.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); createInternMutation.mutate(newIntern); }} className="space-y-6 py-4 text-left">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter Name"
                                    required
                                    value={newIntern.name}
                                    onChange={(e) => setNewIntern({ ...newIntern, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                <Input
                                    type="email"
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter Email"
                                    required
                                    value={newIntern.email}
                                    onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter Phone Number"
                                    required
                                    value={newIntern.phoneNumber}
                                    onChange={(e) => setNewIntern({ ...newIntern, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">College Name</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter College"
                                    required
                                    value={newIntern.college}
                                    onChange={(e) => setNewIntern({ ...newIntern, college: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Branch</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter Branch"
                                    required
                                    value={newIntern.branch}
                                    onChange={(e) => setNewIntern({ ...newIntern, branch: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Semester</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter Semester"
                                    required
                                    value={newIntern.semester}
                                    onChange={(e) => setNewIntern({ ...newIntern, semester: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">University Name</Label>
                                <Input
                                    className="h-10 bg-white/5 border-white/10 rounded-xl font-medium"
                                    placeholder="Enter University"
                                    required
                                    value={newIntern.universityName}
                                    onChange={(e) => setNewIntern({ ...newIntern, universityName: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-4 border-t border-white/5 mt-4">
                            <Button type="button" variant="outline" className="rounded-xl font-bold h-11 border-white/10" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                className="rounded-xl font-black px-8 h-11 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 transition-all active:scale-95"
                                disabled={createInternMutation.isPending}
                            >
                                {createInternMutation.isPending ? "Adding..." : <><Plus className="h-4 w-4" /> Add Intern</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
