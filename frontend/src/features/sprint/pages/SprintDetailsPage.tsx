import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Paperclip, History } from "lucide-react";
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
import { useProjectByIdQuery } from "../../projects/hooks/useProjects";
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
    const navigate = useNavigate();
    const confirm = useConfirm();

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

    const handleAddComment = (comment: string) => {
        if (!sprintId) return;
        createDiscussion(
            { sprintId, comment },
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
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
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
