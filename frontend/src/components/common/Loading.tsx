import { BrandMark } from "./BrandLogo";
import Spinner from "./Spinner";

/** Full-screen boot / route-transition loader. */
export const Loading = () => (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background">
        <BrandMark className="size-9 animate-pulse" />
        <Spinner className="size-4" />
    </div>
);
