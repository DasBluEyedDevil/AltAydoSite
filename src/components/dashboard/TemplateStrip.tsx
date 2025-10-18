'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionTemplateResponse } from '@/types/MissionTemplate';
import { HolographicBorder, CornerAccents } from '../ui/mobiglas';

// Icons
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

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface TemplateStripProps {
  template: MissionTemplateResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUseForMission: () => void;
}

/**
 * TemplateStrip - Expandable template card for mission template list
 * Displays collapsed summary, expands to show full details inline
 */
const TemplateStrip: React.FC<TemplateStripProps> = ({
  template,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onUseForMission
}) => {
  return (
    <HolographicBorder isActive={isExpanded} intensity={isExpanded ? 'high' : 'medium'}>
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : '100px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden bg-gradient-to-br from-[rgba(var(--mg-panel-dark),0.6)] to-[rgba(var(--mg-panel-dark),0.3)] rounded-lg relative"
      >
        {/* Header - Always Visible (Clickable to expand/collapse) */}
        <div
          role="button"
          tabIndex={0}
          onClick={onToggleExpand}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand();
            }
          }}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${template.name} template details`}
          className="h-[100px] px-6 py-4 cursor-pointer hover:bg-[rgba(var(--mg-primary),0.05)] transition-colors relative focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] focus:ring-inset"
        >
          {/* Circuit pattern overlay */}
          <div className="circuit-bg absolute inset-0 rounded-lg pointer-events-none opacity-20"></div>

          <div className="relative z-10 flex items-center justify-between h-full">
            {/* Left: Icon + Name */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="text-[rgba(var(--mg-primary),0.8)]">
                <TemplateIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgba(var(--mg-primary),0.9)] mb-1">
                  {template.name}
                </h3>
                <div className="text-sm text-[rgba(var(--mg-text),0.6)]">
                  {template.operationType}
                </div>
              </div>
            </div>

            {/* Center: Primary Activity Badge */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="px-3 py-1 rounded bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)]">
                <span className="text-sm text-[rgba(var(--mg-primary),0.9)] font-medium">
                  {template.primaryActivity}
                </span>
              </div>
            </div>

            {/* Right: Date + Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block text-sm text-[rgba(var(--mg-text),0.6)]">
                {new Date(template.createdAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={onEdit}
                  className="p-2 rounded hover:bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)] transition-colors"
                  title="Edit Template"
                  aria-label={`Edit ${template.name}`}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 rounded hover:bg-[rgba(var(--mg-danger),0.2)] text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)] transition-colors"
                  title="Delete Template"
                  aria-label={`Delete ${template.name}`}
                >
                  <TrashIcon />
                </button>
                {!isExpanded && (
                  <button
                    onClick={onUseForMission}
                    className="p-2 rounded hover:bg-[rgba(var(--mg-success),0.2)] text-[rgba(var(--mg-success),0.8)] hover:text-[rgba(var(--mg-success),1)] transition-colors"
                    title="Use for Mission"
                    aria-label={`Use ${template.name} for new mission`}
                  >
                    <ArrowRightIcon />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Corner accents */}
          <CornerAccents variant="animated" color="primary" size="sm" />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="px-6 pb-6 space-y-4"
            >
              {/* Divider */}
              <div className="border-t border-[rgba(var(--mg-primary),0.2)]"></div>

              {/* Operation Details */}
              <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                  Operation Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[rgba(var(--mg-text),0.6)]">Type:</span>
                    <span className="ml-2 text-[rgba(var(--mg-text),0.9)]">{template.operationType}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(var(--mg-text),0.6)]">Activities:</span>
                    <span className="ml-2 text-[rgba(var(--mg-text),0.9)]">
                      {template.primaryActivity} (Primary)
                      {template.secondaryActivity && `, ${template.secondaryActivity} (Secondary)`}
                      {template.tertiaryActivity && `, ${template.tertiaryActivity} (Tertiary)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ship Roster */}
              {template.shipRoster.length > 0 && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Ship Roster
                  </h4>
                  <ul className="space-y-2">
                    {template.shipRoster.map((ship, index) => (
                      <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
                        {ship.size} {ship.category} x{ship.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Personnel Roster */}
              {template.personnelRoster.length > 0 && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Personnel Roster
                  </h4>
                  <ul className="space-y-2">
                    {template.personnelRoster.map((person, index) => (
                      <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
                        {person.profession} x{person.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Equipment */}
              {template.requiredEquipment && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Required Equipment
                  </h4>
                  <p className="text-sm text-[rgba(var(--mg-text),0.9)] whitespace-pre-wrap">
                    {template.requiredEquipment}
                  </p>
                </div>
              )}

              {/* Use Template Button */}
              <div className="pt-2">
                <button
                  onClick={onUseForMission}
                  className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-[rgba(var(--mg-success),0.8)] to-[rgba(var(--mg-success),0.6)] hover:from-[rgba(var(--mg-success),0.9)] hover:to-[rgba(var(--mg-success),0.7)] text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(var(--mg-success),0.5)] relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>USE THIS TEMPLATE FOR NEW MISSION</span>
                    <ArrowRightIcon />
                  </span>
                  {/* Scanline effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan-vertical"></div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </HolographicBorder>
  );
};

export default TemplateStrip;
