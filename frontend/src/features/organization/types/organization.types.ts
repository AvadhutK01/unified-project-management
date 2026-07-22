export interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    ownerUserId: string;
    websiteUrl: string | null;
    description: string;
    status: string;
    plan?: string;
    subscriptionExpiresAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type OrganizationFormState = {
    name: string;
    slug: string;
    websiteUrl: string;
    description: string;
    status: string;
};
