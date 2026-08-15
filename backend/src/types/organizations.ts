import { ORGANIZATION_INVITATION_STATUS } from "../shared/constants/enumConstants.js";

export type InvitationStatus =
    (typeof ORGANIZATION_INVITATION_STATUS)[keyof typeof ORGANIZATION_INVITATION_STATUS];
