const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "/api/v1";

/**
 * Downloads a file attachment directly to the user's machine using the backend media proxy download route.
 * Handles authentication headers, S3 streaming, and native file saving.
 *
 * @param fileUrl The full S3 URL or relative key of the file.
 * @param fileName Optional target filename.
 */
export const downloadFile = async (
    fileUrl: string,
    fileName?: string | null,
) => {
    if (!fileUrl) return;

    const token = localStorage.getItem("token");
    let cleanName = fileName || "";

    if (!cleanName) {
        const parts = fileUrl.split("/");
        const rawFilename = parts[parts.length - 1] || "download";
        cleanName = rawFilename.replace(/^\d+_\d*_?/, "");
        try {
            cleanName = decodeURIComponent(cleanName);
        } catch {}
    }

    const downloadEndpointUrl = `${API_BASE_URL}/media/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(cleanName)}`;

    try {
        const response = await fetch(downloadEndpointUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(
                `Download request failed with status ${response.status}`,
            );
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = cleanName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error(
            "Direct blob download failed, attempting fallback download:",
            err,
        );
        const link = document.createElement("a");
        const authParam = token ? `&token=${encodeURIComponent(token)}` : "";
        link.href = `${downloadEndpointUrl}${authParam}`;
        link.download = cleanName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
