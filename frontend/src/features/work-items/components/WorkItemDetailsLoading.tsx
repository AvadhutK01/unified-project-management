const Skeleton = ({ className }: { className?: string }) => (
    <div
        className={`animate-pulse bg-muted/50 rounded-xl ${className ?? ""}`}
    />
);

const WorkItemDetailsLoading = () => {
    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-24" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="size-10" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-[130px]" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex gap-1 p-1 bg-secondary/60 border border-border/40 rounded-xl">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border/60 bg-card/60 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-border/40">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="size-4 rounded" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full rounded-full" />
                        <div className="space-y-3">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
                        <Skeleton className="h-4 w-16 pb-3 border-b border-border/40" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkItemDetailsLoading;
