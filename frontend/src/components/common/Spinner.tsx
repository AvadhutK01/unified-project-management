import { cn } from "@/lib/utils";

interface SpinnerProps {
    className?: string;
    label?: string;
}

const Spinner = ({ className, label = "Loading" }: SpinnerProps) => (
    <span
        role="status"
        aria-label={label}
        className={cn(
            "inline-block size-5 animate-spin rounded-full border-2 border-border border-t-primary",
            className,
        )}
    />
);

export default Spinner;
