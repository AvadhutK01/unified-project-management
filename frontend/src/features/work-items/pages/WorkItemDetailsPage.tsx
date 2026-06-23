import { useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Paperclip, History } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    useWorkItemQuery,
    useUpdateWorkItemStatusMutation,
    useDeleteWorkItemMutation,
    useWorkItemDiscussionsInfiniteQuery,
    useCreateWorkItemDiscussionMutation,
    useDeleteWorkItemDiscussionMutation,
    useWorkItemMediaInfiniteQuery,
    useUploadWorkItemMediaMutation,
    useDeleteWorkItemMediaMutation,
    useWorkItemActivitiesInfiniteQuery,
} from "../hooks/useWorkItems";

import WorkItemDetailsLoading from "../components/WorkItemDetailsLoading";
import WorkItemDetailsError from "../components/WorkItemDetailsError";
import WorkItemDetailsHeader from "../components/WorkItemDetailsHeader";
import WorkItemOverviewTab from "../components/WorkItemOverviewTab";
import WorkItemCommentsTab from "../components/WorkItemCommentsTab";
import WorkItemAttachmentsTab from "../components/WorkItemAttachmentsTab";
import WorkItemActivitiesTab from "../components/WorkItemActivitiesTab";
import WorkItemDetailsCard from "../components/WorkItemDetailsCard";
import EditWorkItemModal from "../components/EditWorkItemModal";

const WorkItemDetailsPage = () => {
    const {
        slug,
        id: projectId,
        phaseId,
        sprintId,
        workItemId,
    } = useParams<{
        slug: string;
        id: string;
        phaseId: string;
        sprintId: string;
        workItemId: string;
    }>();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: workItem,
        isLoading: isWorkItemLoading,
        error: workItemError,
    } = useWorkItemQuery(workItemId);

    const {
        data: discussionsData,
        isLoading: isCommentsLoading,
        fetchNextPage: fetchNextDiscussionsPage,
        hasNextPage: hasNextDiscussionsPage,
        isFetchingNextPage: isFetchingNextDiscussionsPage,
    } = useWorkItemDiscussionsInfiniteQuery(workItemId);
    const {
        data: mediaData,
        isLoading: isMediaLoading,
        fetchNextPage: fetchNextMediaPage,
        hasNextPage: hasNextMediaPage,
        isFetchingNextPage: isFetchingNextMediaPage,
    } = useWorkItemMediaInfiniteQuery(workItemId);
    const {
        data: activitiesData,
        isLoading: isActivitiesLoading,
        fetchNextPage: fetchNextActivitiesPage,
        hasNextPage: hasNextActivitiesPage,
        isFetchingNextPage: isFetchingNextActivitiesPage,
    } = useWorkItemActivitiesInfiniteQuery(workItemId);

    const { mutate: updateWorkItemStatus } = useUpdateWorkItemStatusMutation();
    const { mutate: deleteWorkItem } = useDeleteWorkItemMutation();
    const { mutate: createDiscussion, isPending: isSubmittingComment } =
        useCreateWorkItemDiscussionMutation();
    const { mutate: deleteDiscussion } = useDeleteWorkItemDiscussionMutation();
    const { mutateAsync: uploadMedia } = useUploadWorkItemMediaMutation();
    const { mutate: deleteMedia } = useDeleteWorkItemMediaMutation();

    const project = useMemo(() => {
        return workItem?.projectTitle ? { name: workItem.projectTitle } : null;
    }, [workItem]);

    const phaseName = workItem?.phaseTitle || undefined;
    const sprintName = workItem?.sprintTitle || undefined;
    const discussions =
        discussionsData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    const mediaList =
        mediaData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    const activities =
        activitiesData?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];

    const currentUserEmail = localStorage.getItem("email") || "";

    const handleStatusChange = (newStatus: string) => {
        if (!workItem) return;
        updateWorkItemStatus(
            { id: workItem.id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success("Work item status updated successfully");
                },
                onError: (err: any) => {
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to update work item status",
                    );
                },
            },
        );
    };

    const handleDeleteWorkItem = async () => {
        if (!workItem) return;
        const confirmed = await confirm({
            title: "Delete Work Item?",
            description:
                "Are you sure you want to delete this work item? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteWorkItem(workItem.id, {
            onSuccess: () => {
                toast.success("Work item deleted successfully");
                navigate(
                    `/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`,
                );
            },
            onError: (err: any) => {
                toast.error(
                    err?.response?.data?.message ||
                        "Failed to delete work item",
                );
            },
        });
    };

    const handleAddComment = (comment: string) => {
        if (!workItemId) return;
        createDiscussion(
            { id: workItemId, comment },
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
        if (!workItemId) return;
        const confirmed = await confirm({
            title: "Delete Comment?",
            description: "Are you sure you want to delete this comment?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteDiscussion(
            { id: workItemId, discussionId },
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
        if (!workItemId || !files || files.length === 0) return;
        const file = files[0];

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Maximum size allowed is 10MB.");
            return;
        }

        setIsUploading(true);
        try {
            await uploadMedia({ id: workItemId, file });
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
        if (!workItemId) return;
        const confirmed = await confirm({
            title: "Delete Attachment?",
            description: "Are you sure you want to delete this attachment?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deleteMedia(
            { id: workItemId, mediaId },
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

    if (isWorkItemLoading) {
        return <WorkItemDetailsLoading />;
    }

    if (workItemError || !workItem) {
        return (
            <WorkItemDetailsError
                slug={slug!}
                projectId={projectId!}
                phaseId={phaseId!}
                sprintId={sprintId!}
                workItemError={workItemError}
            />
        );
    }

    const discussionCount = discussions.length;
    const mediaCount = mediaList.length;

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            <WorkItemDetailsHeader
                workItem={workItem}
                project={project}
                phaseName={phaseName}
                sprintName={sprintName}
                slug={slug!}
                projectId={projectId!}
                phaseId={phaseId!}
                sprintId={sprintId!}
                onEdit={() => setEditModalOpen(true)}
                onDelete={handleDeleteWorkItem}
                onStatusChange={handleStatusChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <WorkItemOverviewTab workItem={workItem} />
                        </TabsContent>

                        <TabsContent
                            value="comments"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <WorkItemCommentsTab
                                workItemId={workItemId!}
                                discussions={discussions}
                                isCommentsLoading={isCommentsLoading}
                                currentUserEmail={currentUserEmail}
                                isSubmittingComment={isSubmittingComment}
                                onAddComment={handleAddComment}
                                onDeleteComment={handleDeleteComment}
                                fetchNextPage={fetchNextDiscussionsPage}
                                hasNextPage={hasNextDiscussionsPage}
                                isFetchingNextPage={
                                    isFetchingNextDiscussionsPage
                                }
                            />
                        </TabsContent>

                        <TabsContent
                            value="attachments"
                            className="mt-4 focus-visible:outline-hidden"
                        >
                            <WorkItemAttachmentsTab
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
                            <WorkItemActivitiesTab
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
                    <WorkItemDetailsCard
                        workItem={workItem}
                        project={project}
                        phaseName={phaseName}
                        sprintName={sprintName}
                    />
                </div>
            </div>

            <EditWorkItemModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                workItem={workItem}
                onEditWorkItem={() => {
                    toast.success("Work item updated successfully");
                }}
            />
        </div>
    );
};

export default WorkItemDetailsPage;
