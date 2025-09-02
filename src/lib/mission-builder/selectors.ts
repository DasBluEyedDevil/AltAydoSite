import type { MissionBuilderState } from './store';
import { isMissionDraftValid, validateMissionDraft } from './validation';

export function selectMission(state: MissionBuilderState) {
  return state.mission;
}

export function selectParticipantCount(state: MissionBuilderState) {
  return state.mission.participants.length;
}

export function selectShipCount(state: MissionBuilderState) {
  const ids = new Set<string>();
  for (const p of state.mission.participants) {
    if (p.shipId && !p.isGroundSupport) ids.add(p.shipId);
  }
  return ids.size;
}

export function selectGroundSupportCount(state: MissionBuilderState) {
  return state.mission.participants.filter((p) => p.isGroundSupport).length;
}

export function selectSaveStatus(state: MissionBuilderState) {
  return state.status;
}

export function selectErrors(state: MissionBuilderState) {
  return state.errors;
}

export function selectIsValid(state: MissionBuilderState) {
  return isMissionDraftValid(state.mission);
}

export function selectValidationIssues(state: MissionBuilderState) {
  const res = validateMissionDraft(state.mission);
  if (res.success) return undefined;
  return res.errors;
}

export function selectSummary(state: MissionBuilderState) {
  return {
    participantCount: selectParticipantCount(state),
    shipCount: selectShipCount(state),
    groundSupportCount: selectGroundSupportCount(state),
  } as const;
}
