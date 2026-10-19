import { z } from "zod";
import { CATEGORIES, COMPLAINT_STATUSES, REPORT_REASONS } from "../db/schema";

export const createComplaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Grievance title must be at least 5 characters." })
    .max(180, { message: "Grievance title cannot exceed 180 characters." }),
  description: z
    .string()
    .trim()
    .min(15, { message: "Factual incident description must be at least 15 characters." })
    .max(3000, { message: "Description cannot exceed 3,000 characters." }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select an authorized planetary jurisdiction category." }),
  }),
  authorName: z
    .string()
    .trim()
    .max(60, { message: "Citizen moniker cannot exceed 60 characters." })
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  isAnonymous: z.boolean().default(true),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const createVoteSchema = z.object({
  complaintId: z.string().uuid({ message: "Invalid Case File ID format." }),
  voteType: z.union([z.literal(1), z.literal(-1)], {
    errorMap: () => ({ message: "Vote must be either +1 (Endorse) or -1 (Refute)." }),
  }),
});

export type CreateVoteInput = z.infer<typeof createVoteSchema>;

export const createReportSchema = z.object({
  complaintId: z.string().uuid({ message: "Invalid Case File ID format." }),
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: "Please select an authorized reporting cause." }),
  }),
  details: z
    .string()
    .trim()
    .max(1000, { message: "Violation details cannot exceed 1,000 characters." })
    .optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateComplaintStatusSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES, {
    errorMap: () => ({ message: "Invalid disposition status." }),
  }),
  verdict: z
    .string()
    .trim()
    .max(2000, { message: "Official verdict decree cannot exceed 2,000 characters." })
    .optional(),
  verdictBy: z
    .string()
    .trim()
    .max(100, { message: "Moderator title cannot exceed 100 characters." })
    .optional(),
});

export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  password: z.string().min(8, "Security passphrase must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const complaintFilterSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(COMPLAINT_STATUSES).optional(),
  sort: z.enum(["trending", "top", "new"]).default("trending"),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export type ComplaintFilterQuery = z.infer<typeof complaintFilterSchema>;
