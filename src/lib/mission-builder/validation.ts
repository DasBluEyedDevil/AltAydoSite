import { z } from 'zod';
import type {
  BuilderMissionStatus,
  BuilderMissionType,
  MissionDraft,
} from '@/types/mission-builder';

export const missionStatusValues: readonly BuilderMissionStatus[] = [
  'Planning',
  'Briefing',
  'In Progress',
  'Debriefing',
  'Completed',
  'Archived',
  'Cancelled',
] as const;

export const missionTypeValues: readonly BuilderMissionType[] = [
  'Cargo Haul',
  'Salvage Operation',
  'Bounty Hunting',
  'Exploration',
  'Reconnaissance',
  'Medical Support',
  'Combat Patrol',
  'Escort Duty',
  'Mining Expedition',
] as const;

export const waypointSchema = z.object<z.ZodRawShape>({
  id: z.string().min(1),
  system: z.string().optional(),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  z: z.number().finite().optional(),
  note: z.string().optional(),
});

export const rewardSchema = z.object<z.ZodRawShape>({
  credits: z.number().int().nonnegative().optional(),
  rep: z.number().int().optional(),
  items: z.array(z.string().min(1)).optional(),
});

export const participantDraftSchema = z.object<z.ZodRawShape>({
  userId: z.string().min(1, 'userId is required'),
  userName: z.string().min(1, 'userName is required'),
  shipId: z.string().optional(),
  shipName: z.string().optional(),
  shipType: z.string().optional(),
  manufacturer: z.string().optional(),
  image: z.string().optional(),
  crewRequirement: z.number().int().nonnegative().optional(),
  isGroundSupport: z.boolean().optional(),
  roles: z.array(z.string().min(1)).optional(),
});

export const missionDraftSchema = z.object<z.ZodRawShape>({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(missionTypeValues as [BuilderMissionType, ...BuilderMissionType[]]),
  scheduledDateTime: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'scheduledDateTime must be an ISO date string'),
  status: z.enum(missionStatusValues as [BuilderMissionStatus, ...BuilderMissionStatus[]]),
  briefSummary: z.string().default(''),
  details: z.string().default(''),
  location: z.string().optional(),
  leaderId: z.string().optional(),
  leaderName: z.string().optional(),
  images: z.array(z.string().min(1)).default([]),
  participants: z.array(participantDraftSchema).default([]),
  waypoints: z.array(waypointSchema).optional(),
  rewards: rewardSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().int().optional(),
});

export type MissionDraftInput = z.input<typeof missionDraftSchema>;
export type MissionDraftOutput = z.output<typeof missionDraftSchema>;

export type FieldErrors = Record<string, string>;

export function validateMissionDraft(data: unknown): { success: true; data: MissionDraftOutput } | { success: false; errors: FieldErrors } {
  const result = missionDraftSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
    }
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}

export function isMissionDraftValid(data: unknown): data is MissionDraftOutput {
  return missionDraftSchema.safeParse(data).success;
}

export function coerceToMissionDraft(data: Partial<MissionDraft>): MissionDraft {
  // Utility to coerce partial/legacy shapes to MissionDraft while preserving values
  return missionDraftSchema.parse(data as any) as MissionDraft;
}
