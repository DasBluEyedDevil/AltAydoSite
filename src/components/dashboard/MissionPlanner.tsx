'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MobiGlasPanel } from '@/components/ui/mobiglas';
import MobiGlasButton from '../ui/mobiglas/MobiGlasButton';
import MissionPlannerForm from './MissionPlannerForm';
import {
  PlannedMission,
  PlannedMissionResponse,
  PlannedMissionValidationErrors,
  PlannedMissionStatus,
  ExpectedParticipant,
  ConfirmedParticipant,
  createEmptyMission
} from '@/types/PlannedMission';
import { MissionTemplate } from '@/types/MissionTemplate';
import { shipDatabase } from '@/types/ShipData';

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShipIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

// Status badge colors
const STATUS_COLORS: Record<PlannedMissionStatus, string> = {
  DRAFT: 'bg-[rgba(var(--mg-text),0.2)] text-[rgba(var(--mg-text),0.7)]',
  SCHEDULED: 'bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),1)]',
  ACTIVE: 'bg-[rgba(var(--mg-success),0.2)] text-[rgba(var(--mg-success),1)]',
  DEBRIEFING: 'bg-[rgba(255,193,7),0.2] text-[rgba(255,193,7,1)]',
  COMPLETED: 'bg-[rgba(var(--mg-secondary),0.2)] text-[rgba(var(--mg-secondary),1)]',
  CANCELLED: 'bg-[rgba(var(--mg-danger),0.2)] text-[rgba(var(--mg-danger),0.8)]'
};

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'debrief';

interface MissionPlannerProps {
  initialMissionId?: string;
}

const MissionPlanner: React.FC<MissionPlannerProps> = ({ initialMissionId }) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [missions, setMissions] = useState<PlannedMissionResponse[]>([]);
  const [templates, setTemplates] = useState<MissionTemplate[]>([]);
  const [selectedMission, setSelectedMission] = useState<PlannedMissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errors, setErrors] = useState<PlannedMissionValidationErrors>({});
  const [statusFilter, setStatusFilter] = useState<PlannedMissionStatus | 'all'>('all');
  const [rsvpData, setRsvpData] = useState<Record<string, { count: number; users: Array<{ username: string; globalName?: string; nickname?: string }> }>>({});

  // Track if we've already processed URL params
  const templateParamProcessed = useRef(false);
  const missionIdParamProcessed = useRef(false);

  // Debrief state
  const [debriefParticipants, setDebriefParticipants] = useState<Record<string, boolean>>({});

  // Form data
  const [formData, setFormData] = useState<Partial<PlannedMission>>(createEmptyMission());

  // Check user clearance
  const userClearance = (session?.user as any)?.clearanceLevel || 1;
  const userId = (session?.user as any)?.id || '';
  const canCreateMission = userClearance >= 3;

  // Fetch missions
  const fetchMissions = useCallback(async () => {
    setIsLoadingList(true);
    try {
      let url = '/api/planned-missions?';
      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMissions(data.items || []);

        // Fetch RSVP data for published missions
        const published = (data.items || []).filter((m: PlannedMissionResponse) => m.discordEvent);
        for (const mission of published) {
          fetchRsvpData(mission.id);
        }
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setIsLoadingList(false);
    }
  }, [statusFilter]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/mission-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  // Fetch RSVP data for a mission
  const fetchRsvpData = async (missionId: string) => {
    try {
      const res = await fetch(`/api/planned-missions/${missionId}/discord`);
      if (res.ok) {
        const data = await res.json();
        setRsvpData(prev => ({
          ...prev,
          [missionId]: {
            count: data.count || 0,
            users: data.rsvps || []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMissions();
    fetchTemplates();
  }, [fetchMissions, fetchTemplates]);

  // Handle initial mission ID
  useEffect(() => {
    if (initialMissionId && missions.length > 0) {
      const mission = missions.find(m => m.id === initialMissionId);
      if (mission) {
        handleEdit(mission);
      }
    }
  }, [initialMissionId, missions]);

  // Handle templateId from URL params (when navigating from template creator)
  useEffect(() => {
    if (templateParamProcessed.current) return;

    const templateId = searchParams.get('templateId');
    if (!templateId || templates.length === 0) return;

    const template = templates.find(t => t.id === templateId);
    if (template) {
      templateParamProcessed.current = true;

      // Pre-populate form with template data
      setFormData({
        ...createEmptyMission(),
        templateId: template.id,
        templateName: template.name,
        operationType: template.operationType,
        primaryActivity: template.primaryActivity,
        secondaryActivity: template.secondaryActivity,
        tertiaryActivity: template.tertiaryActivity,
        equipmentNotes: template.requiredEquipment
      });

      // Switch to create mode
      setViewMode('create');

      // Clear the URL param to prevent re-triggering on navigation
      router.replace('/dashboard/mission-planner', { scroll: false });
    }
  }, [searchParams, templates, router]);

  // Handle missionId from URL params (when navigating from Discord event or calendar)
  useEffect(() => {
    if (missionIdParamProcessed.current) return;

    const missionId = searchParams.get('missionId');
    if (!missionId || missions.length === 0) return;

    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      missionIdParamProcessed.current = true;

      // Open the mission in view mode
      setSelectedMission(mission);
      setViewMode('view');

      // Clear the URL param to prevent re-triggering on navigation
      router.replace('/dashboard/mission-planner', { scroll: false });
    }
  }, [searchParams, missions, router]);

  // Reset form
  const resetForm = () => {
    setFormData(createEmptyMission());
    setErrors({});
    setSelectedMission(null);
  };

  // Handle input change
  const handleInputChange = (field: keyof PlannedMission, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof PlannedMissionValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: PlannedMissionValidationErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Mission name must be at least 3 characters';
    }

    if (!formData.scheduledDateTime) {
      newErrors.scheduledDateTime = 'Scheduled date/time is required';
    }

    if (!formData.operationType) {
      newErrors.operationType = 'Operation type is required';
    }

    if (!formData.primaryActivity) {
      newErrors.primaryActivity = 'Primary activity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save mission
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const method = selectedMission ? 'PUT' : 'POST';
      const body = selectedMission
        ? { ...formData, id: selectedMission.id }
        : formData;

      const res = await fetch('/api/planned-missions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await fetchMissions();
        setViewMode('list');
        resetForm();
      } else {
        const data = await res.json();
        setErrors({ general: data.error || 'Failed to save mission' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit mission
  const handleEdit = (mission: PlannedMissionResponse) => {
    setSelectedMission(mission);
    setFormData({
      name: mission.name,
      scheduledDateTime: mission.scheduledDateTime,
      duration: mission.duration,
      location: mission.location,
      templateId: mission.templateId,
      templateName: mission.templateName,
      operationType: mission.operationType,
      primaryActivity: mission.primaryActivity,
      secondaryActivity: mission.secondaryActivity,
      tertiaryActivity: mission.tertiaryActivity,
      leaders: mission.leaders,
      ships: mission.ships,
      objectives: mission.objectives,
      briefing: mission.briefing,
      equipmentNotes: mission.equipmentNotes,
      images: mission.images,
      expectedParticipants: mission.expectedParticipants,
      confirmedParticipants: mission.confirmedParticipants,
      status: mission.status
    });
    setViewMode('edit');
  };

  // Delete mission
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/planned-missions?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchMissions();
      }
    } catch (error) {
      console.error('Error deleting mission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Publish to Discord
  const handlePublishToDiscord = async () => {
    if (!selectedMission) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/planned-missions/${selectedMission.id}/discord`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedMission(data.mission);
        setFormData(prev => ({ ...prev, status: 'SCHEDULED' }));
        await fetchMissions();
        alert('Mission published to Discord successfully!');
      } else {
        const data = await res.json();
        alert(`Failed to publish: ${data.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // View mission
  const handleView = (mission: PlannedMissionResponse) => {
    setSelectedMission(mission);
    setViewMode('view');
  };

  // Start debrief
  const handleStartDebrief = (mission: PlannedMissionResponse) => {
    setSelectedMission(mission);
    // Pre-populate confirmed participants
    const confirmed: Record<string, boolean> = {};
    mission.confirmedParticipants.forEach(p => {
      confirmed[p.odId] = true;
    });
    // Also add expected participants as unchecked
    mission.expectedParticipants.forEach(p => {
      if (!confirmed[p.discordId]) {
        confirmed[p.discordId] = false;
      }
    });
    setDebriefParticipants(confirmed);
    setViewMode('debrief');
  };

  // Toggle participant confirmation
  const toggleParticipantConfirm = (id: string) => {
    setDebriefParticipants(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Save debrief
  const handleSaveDebrief = async () => {
    if (!selectedMission) return;

    setIsLoading(true);
    try {
      // Build confirmed participants list
      const confirmed: ConfirmedParticipant[] = [];
      const now = new Date().toISOString();

      Object.entries(debriefParticipants).forEach(([id, isConfirmed]) => {
        if (isConfirmed) {
          // Find in expected participants first
          const expected = selectedMission.expectedParticipants.find(p => p.discordId === id);
          if (expected) {
            confirmed.push({
              odId: expected.discordId,
              displayName: expected.discordNickname || expected.discordGlobalName || expected.discordUsername,
              discordId: expected.discordId,
              userId: expected.userId,
              aydoHandle: expected.aydoHandle,
              confirmedBy: userId,
              confirmedAt: now
            });
          } else {
            // Check if already in confirmed
            const alreadyConfirmed = selectedMission.confirmedParticipants.find(p => p.odId === id);
            if (alreadyConfirmed) {
              confirmed.push(alreadyConfirmed);
            }
          }
        }
      });

      const res = await fetch(`/api/planned-missions/${selectedMission.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedParticipants: confirmed })
      });

      if (res.ok) {
        await fetchMissions();
        setViewMode('list');
        setSelectedMission(null);
        alert('Attendance saved successfully!');
      } else {
        const data = await res.json();
        alert(`Failed to save attendance: ${data.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete mission (mark as completed)
  const handleCompleteMission = async () => {
    if (!selectedMission) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/planned-missions/${selectedMission.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (res.ok) {
        await fetchMissions();
        setViewMode('list');
        setSelectedMission(null);
        alert('Mission marked as completed!');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate estimated crew for a mission
  const getEstimatedCrew = (mission: PlannedMissionResponse) => {
    return (mission.ships || []).reduce((total, ship) => {
      const shipData = shipDatabase.find(sd => sd.name === ship.shipName);
      return total + (shipData?.crewRequirement || 1) * ship.quantity;
    }, 0);
  };

  // Render list view
  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <MobiGlasPanel
        title="Mission Planner"
        rightContent={
          canCreateMission && (
            <MobiGlasButton
              onClick={() => { resetForm(); setViewMode('create'); }}
              variant="primary"
              size="md"
              leftIcon={<PlusIcon />}
              withGlow
            >
              Plan New Mission
            </MobiGlasButton>
          )
        }
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-[rgba(var(--mg-text),0.7)]">
            Create and manage mission plans. Publish to Discord to gather interest.
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'DRAFT', 'SCHEDULED', 'ACTIVE', 'DEBRIEFING', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),1)]'
                    : 'bg-[rgba(var(--mg-panel-dark),0.3)] text-[rgba(var(--mg-text),0.6)] hover:bg-[rgba(var(--mg-primary),0.1)]'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </MobiGlasPanel>

      {/* Missions Grid */}
      {isLoadingList ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-[rgba(var(--mg-primary),0.6)]">Loading missions...</div>
        </div>
      ) : missions.length === 0 ? (
        <MobiGlasPanel>
          <div className="text-center py-12 text-[rgba(var(--mg-text),0.5)]">
            <CalendarIcon />
            <p className="mt-4">No missions found.</p>
            {canCreateMission && (
              <p className="mt-2">Click &quot;Plan New Mission&quot; to create your first mission.</p>
            )}
          </div>
        </MobiGlasPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)] overflow-hidden hover:border-[rgba(var(--mg-primary),0.4)] transition-all"
            >
              {/* Mission Header Image (first ship) */}
              {mission.ships?.[0] && (
                <div className="h-32 relative">
                  <Image
                    src={mission.ships[0].image}
                    alt={mission.ships[0].shipName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent" />
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[mission.status]}`}>
                    {mission.status}
                  </div>
                </div>
              )}

              {/* Mission Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-[rgba(var(--mg-text),0.95)] mb-2 truncate">
                  {mission.name}
                </h3>

                <div className="flex items-center gap-4 text-sm text-[rgba(var(--mg-text),0.6)] mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon />
                    <span>{formatDate(mission.scheduledDateTime)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[rgba(var(--mg-text),0.5)] mb-4">
                  <div className="flex items-center gap-1">
                    <ShipIcon />
                    <span>{mission.ships?.length || 0} ships</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UsersIcon />
                    <span>~{getEstimatedCrew(mission)} crew</span>
                  </div>
                  {mission.discordEvent && rsvpData[mission.id] && (
                    <div className="flex items-center gap-1 text-[rgba(var(--mg-primary),0.8)] relative group cursor-help">
                      <DiscordIcon />
                      <span>{rsvpData[mission.id].count} interested</span>
                      {rsvpData[mission.id].users.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                          <div className="bg-[rgba(var(--mg-panel-dark),0.95)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg p-3 shadow-lg min-w-[180px]">
                            <div className="text-xs font-medium text-[rgba(var(--mg-primary),1)] mb-2">Interested:</div>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto">
                              {rsvpData[mission.id].users.map((user, idx) => (
                                <div key={idx} className="text-xs text-[rgba(var(--mg-text),0.8)]">
                                  {user.nickname || user.globalName || user.username}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Activity Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-0.5 rounded-full bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),1)] text-xs">
                    {mission.primaryActivity}
                  </span>
                  {mission.secondaryActivity && (
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(var(--mg-secondary),0.2)] text-[rgba(var(--mg-secondary),1)] text-xs">
                      {mission.secondaryActivity}
                    </span>
                  )}
                </div>

                {/* Participants Summary */}
                {(mission.expectedParticipants.length > 0 || mission.confirmedParticipants.length > 0) && (
                  <div className="flex items-center gap-3 text-xs mb-4 p-2 rounded bg-[rgba(var(--mg-panel-dark),0.3)]">
                    {mission.expectedParticipants.length > 0 && (
                      <span className="text-[rgba(var(--mg-text),0.6)]">
                        {mission.expectedParticipants.length} expected
                      </span>
                    )}
                    {mission.confirmedParticipants.length > 0 && (
                      <span className="text-[rgba(var(--mg-success),0.8)]">
                        {mission.confirmedParticipants.length} confirmed
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(mission)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded bg-[rgba(var(--mg-primary),0.1)] text-[rgba(var(--mg-primary),0.8)] hover:bg-[rgba(var(--mg-primary),0.2)] transition-colors text-sm"
                  >
                    <EyeIcon />
                    View
                  </button>
                  {(mission.createdBy === session?.user?.id || userClearance >= 4) && mission.status !== 'COMPLETED' && mission.status !== 'CANCELLED' && (
                    <>
                      {(mission.status === 'ACTIVE' || mission.status === 'DEBRIEFING') && (
                        <button
                          onClick={() => handleStartDebrief(mission)}
                          className="flex items-center justify-center gap-1 py-2 px-3 rounded bg-[rgba(255,193,7,0.1)] text-[rgba(255,193,7,0.9)] hover:bg-[rgba(255,193,7,0.2)] transition-colors text-sm"
                          title="Mark Attendance"
                        >
                          <ClipboardIcon />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(mission)}
                        className="flex items-center justify-center gap-1 py-2 px-3 rounded bg-[rgba(var(--mg-secondary),0.1)] text-[rgba(var(--mg-secondary),0.8)] hover:bg-[rgba(var(--mg-secondary),0.2)] transition-colors text-sm"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(mission.id)}
                        className="flex items-center justify-center gap-1 py-2 px-3 rounded bg-[rgba(var(--mg-danger),0.1)] text-[rgba(var(--mg-danger),0.8)] hover:bg-[rgba(var(--mg-danger),0.2)] transition-colors text-sm"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Render view mode (read-only mission details)
  const renderViewMode = () => {
    if (!selectedMission) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <MobiGlasPanel
          title="Mission Details"
          rightContent={
            <MobiGlasButton
              onClick={() => { setViewMode('list'); setSelectedMission(null); }}
              variant="secondary"
              size="sm"
            >
              Back to List
            </MobiGlasButton>
          }
        >
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[rgba(var(--mg-primary),0.2)]">
            <span className="px-2 py-1 rounded text-xs font-medium bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),1)]">
              VIEWING
            </span>
            <span className="text-[rgba(var(--mg-text),0.9)] font-medium text-lg">{selectedMission.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedMission.status]}`}>
              {selectedMission.status}
            </span>
            <div className="text-[rgba(var(--mg-text),0.6)]">
              {formatDate(selectedMission.scheduledDateTime)}
            </div>
            {selectedMission.location && (
              <div className="text-[rgba(var(--mg-text),0.6)]">
                📍 {selectedMission.location}
              </div>
            )}
            {selectedMission.discordEvent && (
              <div className="flex items-center gap-1 text-[rgba(var(--mg-primary),0.8)]">
                <DiscordIcon />
                Published to Discord
              </div>
            )}
          </div>
        </MobiGlasPanel>

        {/* Mission Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Briefing & Leadership */}
          <div className="space-y-6">
            <MobiGlasPanel title="Mission Briefing">
              <div className="space-y-4">
                <div>
                  <h4 className="mg-subtitle mb-2">OBJECTIVES</h4>
                  <p className="text-[rgba(var(--mg-text),0.8)] whitespace-pre-wrap">
                    {selectedMission.objectives || 'No objectives specified.'}
                  </p>
                </div>
                <div>
                  <h4 className="mg-subtitle mb-2">DETAILED BRIEFING</h4>
                  <p className="text-[rgba(var(--mg-text),0.8)] whitespace-pre-wrap">
                    {selectedMission.briefing || 'No detailed briefing provided.'}
                  </p>
                </div>
                {selectedMission.equipmentNotes && (
                  <div>
                    <h4 className="mg-subtitle mb-2">EQUIPMENT</h4>
                    <p className="text-[rgba(var(--mg-text),0.8)] whitespace-pre-wrap">
                      {selectedMission.equipmentNotes}
                    </p>
                  </div>
                )}
              </div>
            </MobiGlasPanel>

            <MobiGlasPanel title="Leadership">
              {selectedMission.leaders.length > 0 ? (
                <div className="space-y-2">
                  {selectedMission.leaders.map((leader, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded bg-[rgba(var(--mg-panel-dark),0.3)]">
                      <span className="text-[rgba(var(--mg-text),0.6)]">{leader.role}</span>
                      <span className="text-[rgba(var(--mg-text),0.9)] font-medium">{leader.aydoHandle}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[rgba(var(--mg-text),0.5)]">No leaders assigned.</div>
              )}
            </MobiGlasPanel>

            {/* Participants */}
            {(selectedMission.expectedParticipants.length > 0 || selectedMission.confirmedParticipants.length > 0) && (
              <MobiGlasPanel title="Participants">
                <div className="space-y-4">
                  {/* Expected Participants */}
                  {selectedMission.expectedParticipants.length > 0 && (
                    <div>
                      <h4 className="mg-subtitle mb-2">EXPECTED ({selectedMission.expectedParticipants.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMission.expectedParticipants.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[rgba(var(--mg-panel-dark),0.3)]"
                          >
                            {p.discordAvatar && (
                              <Image
                                src={p.discordAvatar}
                                alt=""
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            )}
                            <span className="text-sm text-[rgba(var(--mg-text),0.8)]">
                              {p.discordNickname || p.discordGlobalName || p.discordUsername}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Participants */}
                  {selectedMission.confirmedParticipants.length > 0 && (
                    <div>
                      <h4 className="mg-subtitle mb-2 text-[rgba(var(--mg-success),0.8)]">
                        CONFIRMED ({selectedMission.confirmedParticipants.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMission.confirmedParticipants.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.3)]"
                          >
                            <CheckIcon />
                            <span className="text-sm text-[rgba(var(--mg-text),0.8)]">
                              {p.aydoHandle || p.displayName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </MobiGlasPanel>
            )}
          </div>

          {/* Right Column - Ships */}
          <div className="space-y-6">
            <MobiGlasPanel
              title="Ship Roster"
              rightContent={
                <span className="text-sm text-[rgba(var(--mg-text),0.5)]">
                  Est. {getEstimatedCrew(selectedMission)} crew
                </span>
              }
            >
              {selectedMission.ships.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedMission.ships.map((ship, shipIdx) => (
                    <div
                      key={shipIdx}
                      className="rounded overflow-hidden border border-[rgba(var(--mg-primary),0.2)]"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={ship.image}
                          alt={ship.shipName}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                        <div className="absolute top-1 right-1 bg-[rgba(0,0,0,0.7)] px-2 py-0.5 rounded text-sm">
                          x{ship.quantity}
                        </div>
                        <div className="absolute bottom-1 left-1 bg-[rgba(0,0,0,0.7)] px-2 py-0.5 rounded text-xs">
                          {ship.size}
                        </div>
                      </div>
                      <div className="p-2 bg-[rgba(var(--mg-panel-dark),0.4)]">
                        <div className="text-sm font-medium truncate">{ship.shipName}</div>
                        <div className="text-xs text-[rgba(var(--mg-text),0.5)]">{ship.manufacturer}</div>
                        {ship.notes && (
                          <div className="text-xs text-[rgba(var(--mg-primary),0.7)] mt-1">{ship.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[rgba(var(--mg-text),0.5)]">No ships assigned to this mission.</div>
              )}
            </MobiGlasPanel>
          </div>
        </div>

        {/* Action Buttons - Hidden for COMPLETED/CANCELLED missions */}
        {(selectedMission.createdBy === session?.user?.id || userClearance >= 4) &&
         selectedMission.status !== 'COMPLETED' && selectedMission.status !== 'CANCELLED' && (
          <div className="flex justify-end gap-3">
            {(selectedMission.status === 'ACTIVE' || selectedMission.status === 'DEBRIEFING') && (
              <MobiGlasButton
                onClick={() => handleStartDebrief(selectedMission)}
                variant="secondary"
                size="md"
                leftIcon={<ClipboardIcon />}
              >
                Mark Attendance
              </MobiGlasButton>
            )}
            <MobiGlasButton
              onClick={() => handleEdit(selectedMission)}
              variant="primary"
              size="md"
              leftIcon={<EditIcon />}
            >
              Edit Mission
            </MobiGlasButton>
          </div>
        )}

        {/* Read-only notice for completed/cancelled missions */}
        {(selectedMission.status === 'COMPLETED' || selectedMission.status === 'CANCELLED') && (
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded bg-[rgba(var(--mg-panel-dark),0.5)] text-[rgba(var(--mg-text),0.5)] text-sm">
              This mission is {selectedMission.status.toLowerCase()} and cannot be edited.
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render debrief mode
  const renderDebriefMode = () => {
    if (!selectedMission) return null;

    const allParticipants = [
      ...selectedMission.expectedParticipants.map(p => ({
        id: p.discordId,
        name: p.discordNickname || p.discordGlobalName || p.discordUsername,
        avatar: p.discordAvatar,
        source: 'discord' as const
      })),
      ...selectedMission.confirmedParticipants
        .filter(p => !selectedMission.expectedParticipants.some(e => e.discordId === p.odId))
        .map(p => ({
          id: p.odId,
          name: p.aydoHandle || p.displayName,
          avatar: undefined,
          source: 'manual' as const
        }))
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <MobiGlasPanel
          title="Mark Attendance"
          rightContent={
            <MobiGlasButton
              onClick={() => { setViewMode('list'); setSelectedMission(null); }}
              variant="secondary"
              size="sm"
            >
              Cancel
            </MobiGlasButton>
          }
        >
          <div className="text-[rgba(var(--mg-text),0.7)]">
            <strong>{selectedMission.name}</strong> - {formatDate(selectedMission.scheduledDateTime)}
          </div>
          <div className="text-sm text-[rgba(var(--mg-text),0.5)] mt-2">
            Check the box next to participants who actually showed up for this mission.
          </div>
        </MobiGlasPanel>

        {/* Participants Checklist */}
        <MobiGlasPanel title={`Participants (${allParticipants.length})`}>
          {allParticipants.length > 0 ? (
            <div className="space-y-2">
              {allParticipants.map((participant) => (
                <motion.div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all ${
                    debriefParticipants[participant.id]
                      ? 'bg-[rgba(var(--mg-success),0.15)] border border-[rgba(var(--mg-success),0.4)]'
                      : 'bg-[rgba(var(--mg-panel-dark),0.3)] border border-transparent hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                  }`}
                  onClick={() => toggleParticipantConfirm(participant.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    debriefParticipants[participant.id]
                      ? 'bg-[rgba(var(--mg-success),0.8)] border-[rgba(var(--mg-success),1)]'
                      : 'border-[rgba(var(--mg-text),0.3)]'
                  }`}>
                    {debriefParticipants[participant.id] && <CheckIcon />}
                  </div>
                  {participant.avatar && (
                    <Image
                      src={participant.avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="flex-1 text-[rgba(var(--mg-text),0.9)]">
                    {participant.name}
                  </span>
                  {participant.source === 'discord' && (
                    <DiscordIcon />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[rgba(var(--mg-text),0.5)]">
              No expected participants. Sync RSVPs from Discord or add participants manually.
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
            <div className="text-sm text-[rgba(var(--mg-text),0.6)]">
              <span className="text-[rgba(var(--mg-success),0.8)] font-medium">
                {Object.values(debriefParticipants).filter(Boolean).length}
              </span>
              {' '}of{' '}
              <span className="font-medium">{allParticipants.length}</span>
              {' '}participants confirmed
            </div>
          </div>
        </MobiGlasPanel>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <MobiGlasButton
            onClick={handleSaveDebrief}
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<CheckIcon />}
          >
            Save Attendance
          </MobiGlasButton>
          <MobiGlasButton
            onClick={handleCompleteMission}
            variant="secondary"
            size="md"
            disabled={isLoading}
          >
            Complete Mission
          </MobiGlasButton>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <AnimatePresence mode="wait">
      {viewMode === 'list' && (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderListView()}
        </motion.div>
      )}

      {viewMode === 'view' && (
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderViewMode()}
        </motion.div>
      )}

      {viewMode === 'debrief' && (
        <motion.div
          key="debrief"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderDebriefMode()}
        </motion.div>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MissionPlannerForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            isEditing={viewMode === 'edit'}
            templates={templates}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onCancel={() => { setViewMode('list'); resetForm(); }}
            onPublishToDiscord={viewMode === 'edit' && formData.status === 'DRAFT' ? handlePublishToDiscord : undefined}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionPlanner;
