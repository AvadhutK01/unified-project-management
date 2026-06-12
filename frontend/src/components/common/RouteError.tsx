import { Suspense } from "react";
import { Loading } from "./Loading";
import NotFound from "@/pages/NotFound";

export const RouteError = () => {
    return (
        <Suspense fallback={<Loading />}>
            <NotFound />
        </Suspense>
    );
};
