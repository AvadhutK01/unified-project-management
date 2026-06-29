import { z } from "zod";

export const reportQuerySchema = z.object({
    query: z
        .object({
            startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "startDate must be a valid date",
            }),
            endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "endDate must be a valid date",
            }),
        })
        .refine(
            (data) => {
                const start = new Date(data.startDate).getTime();
                const end = new Date(data.endDate).getTime();
                return start <= end;
            },
            {
                message: "startDate must be before or equal to endDate",
                path: ["startDate"],
            },
        )
        .refine(
            (data) => {
                const start = new Date(data.startDate).getTime();
                const end = new Date(data.endDate).getTime();
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 366;
            },
            {
                message: "Date range cannot exceed 1 year",
                path: ["endDate"],
            },
        ),
});
