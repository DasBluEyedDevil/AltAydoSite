"use client";

import React, { useEffect, useRef, useState } from "react";
import HoloModal from "./HoloModal";
import HolographicButton from "./HolographicButton";
import { MissionResponse } from "@/types/Mission";
import MissionComposer from "./MissionComposer";

interface MissionComposerModalProps {
  isOpen: boolean;
  initialMission?: MissionResponse | null;
  onClose: () => void;
  onSave: (mission: MissionResponse) => void;
}

const MissionComposerModal: React.FC<MissionComposerModalProps> = ({
  isOpen,
  initialMission = null,
  onClose,
  onSave,
}) => {
  const [canSave, setCanSave] = useState(false);
  const [statusText, setStatusText] = useState<string>(initialMission?.status || "Planning");
  const [isDeleting, setIsDeleting] = useState(false);
  const firstInvalidRef = useRef<HTMLElement | null>(null);

  // Receive status and validity from child via callback
  const handleState = (state: { canSave: boolean; status?: string; firstInvalidId?: string | null }) => {
    setCanSave(state.canSave);
    if (state.status) setStatusText(state.status);
    if (state.firstInvalidId) {
      const el = document.getElementById(state.firstInvalidId);
      if (el) firstInvalidRef.current = el as HTMLElement;
    }
  };

  const requestScrollToInvalid = () => {
    if (firstInvalidRef.current) {
      firstInvalidRef.current.focus({ preventScroll: false });
      firstInvalidRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      const focusTarget = () => {
        const target = document.getElementById(firstInvalidRef.current?.id || 'mission-name');
        if (target) (target as HTMLElement).focus();
      };
      const t = setTimeout(focusTarget, 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <HoloModal
      isOpen={isOpen}
      onClose={onClose}
      title="MISSION COMPOSER"
      width="md:w-4/5 lg:w-3/4"
      height="h-[85vh]"
      showCloseButton={false}
    >
      <div className="flex flex-col h-[75vh]">
        {/* Sticky header inside modal body */}
        <div className="sticky top-0 z-10 bg-[rgba(var(--mg-panel-dark),0.85)] border-b border-[rgba(var(--mg-primary),0.15)] backdrop-blur-md">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <h2 className="mg-title text-lg tracking-wider">MISSION COMPOSER</h2>
              <span
                className="text-xs px-2 py-1 border rounded holo-element border-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.8)]"
                aria-live="polite"
              >
                {statusText}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {initialMission?.id && (
                <HolographicButton
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    if (isDeleting) return;
                    if (!initialMission?.id) return;
                    const ok = window.confirm('Delete this mission? This action cannot be undone.');
                    if (!ok) return;
                    try {
                      setIsDeleting(true);
                      const res = await fetch(`/api/fleet-ops/missions?id=${encodeURIComponent(initialMission.id)}`, { method: 'DELETE' });
                      if (!res.ok) {
                        console.error('Failed to delete mission');
                      } else {
                        // Notify listeners and close
                        window.dispatchEvent(new CustomEvent('mission:deleted', { detail: { id: initialMission.id } }));
                        onClose();
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'DELETING…' : 'DELETE'}
                </HolographicButton>
              )}
              <HolographicButton
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                CLOSE
              </HolographicButton>
              <HolographicButton
                variant="primary"
                size="sm"
                disabled={!canSave}
                onClick={() => {
                  if (!canSave) {
                    requestScrollToInvalid();
                    return;
                  }
                  // Ask child to submit via custom event
                  const evt = new CustomEvent("mission-composer:save");
                  window.dispatchEvent(evt);
                }}
              >
                SAVE
              </HolographicButton>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4">
          <MissionComposer
            mission={initialMission}
            onSave={onSave}
            onCancel={onClose}
            onState={handleState}
          />
        </div>
      </div>
    </HoloModal>
  );
};

export default MissionComposerModal;
