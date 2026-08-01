import { useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    FileText,
    MessageSquare,
    Paperclip,
    History,
    LayoutGrid,
    Sparkles,
    Zap,
    CheckCircle2,
    XCircle,
    Trash2,
    PauseCircle,
} from "lucide-react";
import type { WorkItemStatus } from "../types/sprint.types";
import {
    STATUS_LABELS as WI_STATUS_LABELS,
    WORK_ITEM_STATUSES,
} from "@/features/work-items/constants/workitem.constants";

const WI_KPI_CONFIG: Record<
    WorkItemStatus,
    {
        icon: React.ElementType;
        bg: string;
        iconBg: string;
        iconColor: string;
        valueColor: string;
    }
> = {
    new: {
        icon: Sparkles,
        bg: "bg-purple-50 dark:bg-purple-950/30",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
        iconColor: "text-purple-600 dark:text-purple-400",
        valueColor: "text-purple-700 dark:text-purple-300",
    },
    active: {
        icon: Zap,
        bg: "bg-green-50 dark:bg-green-950/30",
        iconBg: "bg-green-100 dark:bg-green-900/40",
        iconColor: "text-green-600 dark:text-green-400",
        valueColor: "text-green-700 dark:text-green-300",
    },
    resolved: {
        icon: CheckCircle2,
        bg: "bg-blue-50 dark:bg-blue-950/30",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-700 dark:text-blue-300",
    },
    closed: {
        icon: XCircle,
        bg: "bg-gray-50 dark:bg-gray-950/30",
        iconBg: "bg-gray-100 dark:bg-gray-900/40",
        iconColor: "text-gray-600 dark:text-gray-400",
        valueColor: "text-gray-700 dark:text-gray-300",
    },
    removed: {
        icon: Trash2,
        bg: "bg-red-50 dark:bg-red-950/30",
        iconBg: "bg-red-100 dark:bg-red-900/40",
        iconColor: "text-red-600 dark:text-red-400",
        valueColor: "text-red-700 dark:text-red-300",
    },
    onhold: {
        icon: PauseCircle,
        bg: "bg-amber-50 dark:bg-amber-950/30",
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        iconColor: "text-amber-600 dark:text-amber-400",
        valueColor: "text-amber-700 dark:text-amber-300",
    },
};
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { STATUS_LABELS } from "../constants/sprint.constants";
import type { SprintStatus } from "../types/sprint.types";
import {
    useSprintQuery,
    useUpdateSprintMutation,
    useDeleteSprintMutation,
    useSprintActivitiesInfiniteQuery,
    useSprintDiscussionsInfiniteQuery,
    useCreateSprintDiscussionMutation,
    useDeleteSprintDiscussionMutation,
    useSprintMediaInfiniteQuery,
    useUploadSprintMediaMutation,
    useDeleteSprintMediaMutation,
} from "../hooks/useSprints";
import {
    useProjectByIdQuery,
    useProjectMembersQuery,
} from "../../projects/hooks/useProjects";
import { usePhaseByIdQuery } from "../../phases/hooks/usePhases";

import SprintDetailsLoading from "../components/SprintDetailsLoading";
import SprintDetailsError from "../components/SprintDetailsError";
import SprintDetailsHeader from "../components/SprintDetailsHeader";
import SprintOverviewTab from "../components/SprintOverviewTab";
import SprintCommentsTab from "../components/SprintCommentsTab";
import SprintAttachmentsTab from "../components/SprintAttachmentsTab";
import SprintActivitiesTab from "../components/SprintActivitiesTab";
import SprintTrackerCard from "../components/SprintTrackerCard";
import SprintDetailsCard from "../components/SprintDetailsCard";
import EditSprintModal from "../components/EditSprintModal";

const SprintDetailsPage = () => {
    const {
        slug,
        id: projectId,
        phaseId,
        sprintId,
    } = useParams<{
        slug: string;
        id: string;
        phaseId: string;
        sprintId: string;
    }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const initialTab = searchParams.get("tab") || "overview";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Queries
    const {
        data: sprintRes,
        isLoading: isSprintLoading,
        error: sprintError,
    } = useSprintQuery(sprintId);
    const { data: projectRes } = useProjectByIdQuery(projectId);
    const { data: projectMembersRes } = useProjectMembersQuery(projectId);
    const { data: phaseRes } = usePhaseByIdQuery(phaseId);
    const {
        data: discussionsData,
        isLoading: isCommentsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSprintDiscussionsInfiniteQuery(sprintId);
    const {
        data: mediaData,
        isLoading: isMediaLoading,
        fetchNextPage: fetchNextMediaPage,
        hasNextPage: hasNextMediaPage,
        isFetchingNextPage: isFetchingNextMediaPage,
    } = useSprintMediaInfiniteQuery(sprintId);
    const {
        data: activitiesData,
        isLoading: isActivitiesLoading,
        fetchNextPage: fetchNextActivitiesPage,
        hasNextPage: hasNextActivitiesPage,
        isFetchingNextPage: isFetchingNextActivitiesPage,
    } = useSprintActivitiesInfiniteQuery(sprintId);

    // Mutations
    const { mutate: updateSprintStatus } = useUpdateSprintMutation();
    const { mutate: deleteSprint } = useDeleteSprintMutation();
    const { mutate: createDiscussion, isPending: isSubmittingComment } =
        useCreateSprintDiscussionMutation();
    const { mutate: deleteDiscussion } = useDeleteSprintDiscussionMutation();
    const { mutateAsync: uploadMedia } = useUploadSprintMediaMutation();
    const { mutate: deleteMedia } = useDeleteSprintMediaMutation();

    const sprint = sprintRes?.data ?? null;
    const project = projectRes?.data ?? null;
    const phaseName = phaseRes?.data?.name;
    const discussions =
        discussionsData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    const mediaList =
        mediaData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    const activities =
        activitiesData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];

    const users = useMemo(() => {
        const members = projectMembersRes?.data?.data ?? [];
        return members.map(
            (m: { memberId: string; name: string; status?: string }) => ({
                id: m.memberId,
                name: m.name,
                status: m.status,
            }),
        );
    }, [projectMembersRes]);

    const currentUserEmail = localStorage.getItem("email") || "";

    const handleStatusChange = (newStatus: string) => {
        if (!sprint) return;
        updateSprintStatus(
            {
                id: sprint.id,
                payload: {
                    title: sprint.title,
                    description: sprint.description,
                    acceptanceCriteria: sprint.acceptanceCriteria,
                    status: newStatus as any,
                    startDate: sprint.startDate ?? "",
                    endDate: sprint.endDate ?? "",
                    sequence: sprint.sequence ?? 0,
                },
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Sprint status updated to ${STATUS_LABELS[newStatus as SprintStatus]}`,
                    );
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to update sprint status",
                    );
                },
            },
        );
    };

    const handleDeleteSprint = async () => {
        if (!sprint) return;
        const confirmed = await confirm({
            title: "Delete Sprint?",
            description:
                "Are you sure you want to delete this sprint? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteSprint(sprint.id, {
            onSuccess: () => {
                toast.success("Sprint deleted successfully");
                navigate(
                    `/${slug}/projects/${projectId}/phases/${phaseId}/sprints`,
                );
            },
            onError: (err: any) => {
                toast.error(
                    err?.response?.data?.message || "Failed to delete sprint",
                );
            },
        });
    };

    const handleAddComment = (
        comment: string,
        mentions?: { id: string; name: string }[],
    ) => {
        if (!sprintId) return;
        const taggedMemberIds = mentions?.map((m) => m.id) ?? [];
        createDiscussion(
            { sprintId, comment, taggedMemberIds },
            {
                onSuccess: () => {
                    toast.success("Comment added successfully");
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message || "Failed to add comment",
                    );
                },
            },
        );
    };

    const handleDeleteComment = async (discussionId: string) => {
        if (!sprintId) return;
        const confirmed = await confirm({
            title: "Delete Comment?",
            description: "Are you sure you want to delete this comment?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteDiscussion(
            { sprintId, discussionId },
            {
                onSuccess: () => {
                    toast.success("Comment deleted successfully");
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to delete comment",
                    );
                },
            },
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!sprintId || !files || files.length === 0) return;
        const file = files[0];

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Maximum size allowed is 10MB.");
            return;
        }

        setIsUploading(true);
        try {
            await uploadMedia({ sprintId, file });
            toast.success("Attachment uploaded successfully");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to upload file",
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteMedia = async (mediaId: string) => {
        if (!sprintId) return;
        const confirmed = await confirm({
            title: "Delete Attachment?",
            description: "Are you sure you want to delete this attachment?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteMedia(
            { sprintId, mediaId },
            {
                onSuccess: () => {
                    toast.success("Attachment deleted successfully");
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to delete attachment",
                    );
                },
            },
        );
    };

    if (isSprintLoading) {
        return <SprintDetailsLoading />;
    }

    if (sprintError || !sprint) {
        return (
            <SprintDetailsError
                slug={slug!}
                projectId={projectId!}
                phaseId={phaseId!}
                sprintError={sprintError}
            />
        );
    }

    const discussionCount = discussions.length;
    const mediaCount = mediaList.length;

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
            <SprintDetailsHeader
                sprint={sprint}
                project={project}
                phaseName={phaseName}
                slug={slug!}
                projectId={projectId!}
                phaseId={phaseId!}
                onEdit={() => setEditModalOpen(true)}
                onDelete={handleDeleteSprint}
                onStatusChange={handleStatusChange}
            />

            {/* Work Items KPI */}
            {sprint.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {/* Total */}
                    <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border p-4 bg-violet-50 dark:bg-violet-950/30 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                            <LayoutGrid
                                size={18}
                                className="text-violet-600 dark:text-violet-400"
                            />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                                {sprint.metrics.totalWorkItems}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Total Items
                            </p>
                        </div>
                    </div>

                    {/* Per-status */}
                    {WORK_ITEM_STATUSES.map((status) => {
                        const {
                            icon: Icon,
                            bg,
                            iconBg,
                            iconColor,
                            valueColor,
                        } = WI_KPI_CONFIG[status];
                        const count =
                            sprint.metrics!.workitemsByStatus[status] ?? 0;
                        return (
                            <div
                                key={status}
                                className={`rounded-xl border p-4 ${bg} flex items-center gap-3`}
                            >
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                                >
                                    <Icon size={15} className={iconColor} />
                                </div>
                                <div>
                                    <p
                                        className={`text-xl font-bold ${valueColor}`}
                                    >
                                        {count}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                        {WI_STATUS_LABELS[status]}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="bg-secondary/60 border border-border/40 rounded-xl p-1 w-full sm:w-auto flex flex-wrap gap-1">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-2 px-4 py-2 font-semibold hover:text-primary data-active:bg-primary/10 data-active:text-primary"
                            >
                                <FileText className="size-4" />
                                <span>Overview</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="comments"
                                className="flex items-center gap-2 px-4 py-2 font-semibold hover:text-primary data-active:bg-primary/10 data-active:text-primary"
                            >
                                <MessageSquare className="size-4" />
                                <span>Comments</span>
                                {discussionCount > 0 && (
                                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                        {discussionCount}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="attachments"
                                className="flex items-center gap-2 px-4 py-2 font-semibold hover:text-primary data-active:bg-primary/10 data-active:text-primary"
                            >
                                <Paperclip className="size-4" />
                                <span>Attachments</span>
                                {mediaCount > 0 && (
                                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                        {mediaCount}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="activities"
                                className="flex items-center gap-2 px-4 py-2 font-semibold hover:text-primary data-active:bg-primary/10 data-active:text-primary"
                            >
                                <History className="size-4" />
                                <span>Activity Log</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="overview"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <SprintOverviewTab sprint={sprint} />
                        </TabsContent>

                        <TabsContent
                            value="comments"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <SprintCommentsTab
                                sprintId={sprintId!}
                                discussions={discussions}
                                isCommentsLoading={isCommentsLoading}
                                currentUserEmail={currentUserEmail}
                                isSubmittingComment={isSubmittingComment}
                                onAddComment={handleAddComment}
                                onDeleteComment={handleDeleteComment}
                                fetchNextPage={fetchNextPage}
                                hasNextPage={hasNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                users={users}
                            />
                        </TabsContent>

                        <TabsContent
                            value="attachments"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <SprintAttachmentsTab
                                mediaList={mediaList}
                                isMediaLoading={isMediaLoading}
                                currentUserEmail={currentUserEmail}
                                isUploading={isUploading}
                                fileInputRef={fileInputRef}
                                onFileUpload={handleFileUpload}
                                onDeleteMedia={handleDeleteMedia}
                                fetchNextPage={fetchNextMediaPage}
                                hasNextPage={hasNextMediaPage}
                                isFetchingNextPage={isFetchingNextMediaPage}
                            />
                        </TabsContent>

                        <TabsContent
                            value="activities"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <SprintActivitiesTab
                                activities={activities}
                                isActivitiesLoading={isActivitiesLoading}
                                fetchNextPage={fetchNextActivitiesPage}
                                hasNextPage={hasNextActivitiesPage}
                                isFetchingNextPage={
                                    isFetchingNextActivitiesPage
                                }
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6 sticky top-6 self-start">
                    <SprintTrackerCard sprint={sprint} />
                    <SprintDetailsCard
                        sprint={sprint}
                        project={project}
                        phaseId={phaseId!}
                    />
                </div>
            </div>

            <EditSprintModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                sprint={sprint}
                onEditSprint={() => {
                    toast.success("Sprint updated successfully");
                }}
            />
        </div>
    );
};

export default SprintDetailsPage;
