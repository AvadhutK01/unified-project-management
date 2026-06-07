import { Router } from "express";
import {
    handleCreateOrganization,
    handleGetOrganizationById,
    handleGetMyOrganizations,
    handleGetAllOrganizations,
    handleUpdateOrganization,
    handleDeleteOrganization,
} from "./organization.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import {
    createOrganizationSchema,
    updateOrganizationSchema,
    organizationIdParamSchema,
    paginationQuerySchema,
} from "./organization.validation.js";

import { uploadImage } from "../../../shared/middleware/upload.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    uploadImage.single("logo"),
    validateRequest(createOrganizationSchema),
    handleCreateOrganization,
);
router.get(
    "/",
    validateRequest(paginationQuerySchema),
    handleGetAllOrganizations,
);
router.get(
    "/mine",
    validateRequest(paginationQuerySchema),
    handleGetMyOrganizations,
);
router.get(
    "/:id",
    validateRequest(organizationIdParamSchema),
    handleGetOrganizationById,
);
router.put(
    "/:id",
    uploadImage.single("logo"),
    validateRequest(updateOrganizationSchema),
    handleUpdateOrganization,
);
router.delete(
    "/:id",
    validateRequest(organizationIdParamSchema),
    handleDeleteOrganization,
);

export { router as organizationRouter };
