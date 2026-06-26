import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import RichTextEditor from "@/components/common/RichTextEditor";
import MultiSelect from "@/components/common/MultiSelect";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    projectFormSchema,
    type ProjectFormValues,
} from "../schema/projects.schemas";
import { PROJECT_STATUS_OPTIONS } from "../constants/projects.constants";
import { ProjectImageUploader } from "./ProjectImageUploader";
import { useInfiniteMembersQuery } from "@/features/members/hooks/useMembers";
import { useMemo, useState } from "react";
import { useCreateProjectMutation } from "../hooks/useProjects";
import { toast } from "sonner";
import { PermissionGuard } from "@/features/rbac/components/PermissionGuard";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

const ProjectCreateModal = () => {
    const [open, setOpen] = useState(false);
    const { data: members } = useInfiniteMembersQuery("joined", "", true);
    const { mutate: createProject, isPending: isSubmitting } =
        useCreateProjectMutation();

    const memberOptions = useMemo(
        () =>
            members?.pages.flatMap((page) =>
                page.data.data.map((member: any) => ({
                    label: `${member.username} · ${member.roleName}`,
                    value: member.id,
                })),
            ) ?? [],
        [members],
    );

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            projectName: "",
            description: "",
            client: "",
            projectTeam: [],
            startDate: new Date(),
            endDate: new Date(),
            status: "notstarted",
            projectImage: null,
        },
    });

    const startDate = form.watch("startDate");

    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const onSubmit = (data: ProjectFormValues) => {
        const formData = new FormData();
        formData.append("title", data.projectName);
        formData.append("description", data.description);
        formData.append("clientName", data.client);
        formData.append("status", data.status);
        formData.append(
            "startDate",
            data.startDate ? format(data.startDate, "yyyy-MM-dd") : "",
        );
        formData.append(
            "endDate",
            data.endDate ? format(data.endDate, "yyyy-MM-dd") : "",
        );

        data.projectTeam.forEach((memberId) => {
            formData.append("orgMemberIds[]", memberId);
        });

        if (data.projectImage) {
            formData.append("logo", data.projectImage);
        }

        createProject(formData, {
            onSuccess: () => {
                toast.success("Project created successfully!");
                setOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                console.error(error);
                toast.error(
                    error?.response?.data?.message ||
                        "Failed to create project. Please try again.",
                );
            },
        });
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(val) => {
                setOpen(val);
                if (!val) {
                    form.reset();
                }
            }}
        >
            <PermissionGuard permission={PERMISSIONS.PROJECTS.ADD}>
                <SheetTrigger asChild>
                    <Button>
                        <Plus className="size-4" />
                        New Project
                    </Button>
                </SheetTrigger>
            </PermissionGuard>
            <SheetContent showCloseButton={false} className="w-150! max-w-150!">
                <SheetHeader>
                    <SheetTitle>Add Project</SheetTitle>
                    <SheetDescription>
                        Add a new project to your agency.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="projectName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                id="projectName"
                                                placeholder="Enter project name"
                                                className="ring-0!"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="Enter project description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="client"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Client</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter client name"
                                                    className="ring-0!"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {PROJECT_STATUS_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="projectTeam"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team Members</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={memberOptions}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col flex-1">
                                            <FormLabel>Start Date</FormLabel>

                                            <Popover
                                                open={startDateOpen}
                                                onOpenChange={setStartDateOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                                                                !field.value &&
                                                                    "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value
                                                                ? format(
                                                                      field.value,
                                                                      "PPP",
                                                                  )
                                                                : "Pick start date"}
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </button>
                                                    </FormControl>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            field.onChange(
                                                                date,
                                                            );
                                                            setStartDateOpen(
                                                                false,
                                                            );
                                                        }}
                                                        disabled={{
                                                            before: new Date(),
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col flex-1">
                                            <FormLabel>End Date</FormLabel>

                                            <Popover
                                                open={endDateOpen}
                                                onOpenChange={setEndDateOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                                                                !field.value &&
                                                                    "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value
                                                                ? format(
                                                                      field.value,
                                                                      "PPP",
                                                                  )
                                                                : "Pick end date"}
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </button>
                                                    </FormControl>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            field.onChange(
                                                                date,
                                                            );
                                                            setEndDateOpen(
                                                                false,
                                                            );
                                                        }}
                                                        disabled={{
                                                            before: startDate,
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="projectImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project Cover Image
                                        </FormLabel>
                                        <FormControl>
                                            <ProjectImageUploader
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <SheetFooter className="flex flex-row justify-end gap-2 px-0 mt-6">
                                <SheetClose asChild>
                                    <Button variant="outline">Close</Button>
                                </SheetClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ProjectCreateModal;
