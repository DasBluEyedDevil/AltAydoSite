'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MobiGlasPanel from './MobiGlasPanel';
import MobiGlasButton from '../ui/mobiglas/MobiGlasButton';
import {
  MissionTemplate,
  MissionTemplateShip,
  MissionTemplatePersonnel,
  MissionTemplateValidationErrors,
  ActivityType,
  OperationType,
  ShipSize,
  ShipCategory,
  PersonnelProfession
} from '@/types/MissionTemplate';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

interface MissionTemplateFormProps {
  formData: Partial<MissionTemplate>;
  errors: MissionTemplateValidationErrors;
  isLoading: boolean;
  isEditing: boolean;
  onInputChange: (field: keyof MissionTemplate, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddShip: () => void;
  onUpdateShip: (index: number, field: keyof MissionTemplateShip, value: any) => void;
  onRemoveShip: (index: number) => void;
  onAddPersonnel: () => void;
  onUpdatePersonnel: (index: number, field: keyof MissionTemplatePersonnel, value: any) => void;
  onRemovePersonnel: (index: number) => void;
  getAvailableActivities: (excludeField?: 'primary' | 'secondary' | 'tertiary') => ActivityType[];
}

const MissionTemplateForm: React.FC<MissionTemplateFormProps> = ({
  formData,
  errors,
  isLoading,
  isEditing,
  onInputChange,
  onSave,
  onCancel,
  onAddShip,
  onUpdateShip,
  onRemoveShip,
  onAddPersonnel,
  onUpdatePersonnel,
  onRemovePersonnel,
  getAvailableActivities
}) => {
  // Constants
  const OPERATION_TYPES: OperationType[] = ['Ground Operations', 'Space Operations'];
  const SHIP_SIZES: ShipSize[] = ['Small', 'Medium', 'Large', 'Capital'];
  const SHIP_CATEGORIES: ShipCategory[] = ['Fighter', 'Transport', 'Industrial', 'Medical'];
  const PERSONNEL_PROFESSIONS: PersonnelProfession[] = ['Pilot', 'Gunner', 'Medic', 'Infantry', 'Engineer'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <MobiGlasPanel
        title={`${isEditing ? 'Edit' : 'Create'} Mission Template`}
        rightContent={
          <MobiGlasButton
            onClick={onCancel}
            variant="secondary"
            size="sm"
            leftIcon={<BackIcon />}
          >
            Back to List
          </MobiGlasButton>
        }
      >
        <div className="text-[rgba(var(--mg-text),0.7)]">
          {isEditing ? 'Modify the existing mission template' : 'Create a new reusable mission template'}
        </div>
      </MobiGlasPanel>

      {/* Basic Information */}
      <MobiGlasPanel title="Basic Information">
        <div className="space-y-6">
          {/* Template Name */}
          <div className="mg-input-group">
            <label className="mg-subtitle block mb-2">
              TEMPLATE NAME *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              className={`mg-input w-full ${errors.name ? 'border-[rgba(var(--mg-danger),0.5)]' : ''}`}
              placeholder="e.g. Hadanite Mining Run"
              maxLength={100}
            />
            {errors.name && (
              <div className="text-[rgba(var(--mg-danger),0.8)] text-sm mt-1">
                {errors.name}
              </div>
            )}
          </div>

          {/* Operation Type */}
          <div className="mg-input-group">
            <label className="mg-subtitle block mb-2">
              OPERATION TYPE
            </label>
            <div className="flex space-x-4">
              {OPERATION_TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="operationType"
                    value={type}
                    checked={formData.operationType === type}
                    onChange={(e) => onInputChange('operationType', e.target.value)}
                    className="mr-2 accent-[rgba(var(--mg-primary),0.8)]"
                  />
                  <span className="text-[rgba(var(--mg-text),0.9)]">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </MobiGlasPanel>

      {/* Activity Selection */}
      <MobiGlasPanel title="Mission Activities">
        <div className="space-y-6">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm mb-4">
            Select the primary, secondary, and tertiary activities for this mission template.
            Each activity can only be selected once.
          </div>

          {/* Primary Activity */}
          <div className="mg-input-group">
            <label className="mg-subtitle block mb-2">
              PRIMARY ACTIVITY *
            </label>
            <select
              value={formData.primaryActivity || ''}
              onChange={(e) => onInputChange('primaryActivity', e.target.value as ActivityType)}
              className={`mg-input w-full ${errors.primaryActivity ? 'border-[rgba(var(--mg-danger),0.5)]' : ''}`}
            >
              <option value="">Select Primary Activity</option>
              {getAvailableActivities('primary').map((activity) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
            {errors.primaryActivity && (
              <div className="text-[rgba(var(--mg-danger),0.8)] text-sm mt-1">
                {errors.primaryActivity}
              </div>
            )}
          </div>

          {/* Secondary Activity */}
          <div className="mg-input-group">
            <label className="mg-subtitle block mb-2">
              SECONDARY ACTIVITY
            </label>
            <select
              value={formData.secondaryActivity || ''}
              onChange={(e) => onInputChange('secondaryActivity', e.target.value ? e.target.value as ActivityType : undefined)}
              className="mg-input w-full"
            >
              <option value="">Select Secondary Activity (Optional)</option>
              {getAvailableActivities('secondary').map((activity) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>

          {/* Tertiary Activity */}
          <div className="mg-input-group">
            <label className="mg-subtitle block mb-2">
              TERTIARY ACTIVITY
            </label>
            <select
              value={formData.tertiaryActivity || ''}
              onChange={(e) => onInputChange('tertiaryActivity', e.target.value ? e.target.value as ActivityType : undefined)}
              className="mg-input w-full"
            >
              <option value="">Select Tertiary Activity (Optional)</option>
              {getAvailableActivities('tertiary').map((activity) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>
        </div>
      </MobiGlasPanel>

      {/* Ship Roster */}
      <MobiGlasPanel
        title="Ship Roster"
        rightContent={
          <MobiGlasButton
            onClick={onAddShip}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon />}
            withScanline={true}
          >
            Add Ship
          </MobiGlasButton>
        }
      >
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            Specify required ships for this mission template. Leave empty for ground-only operations.
          </div>

          {formData.shipRoster && formData.shipRoster.length > 0 ? (
            <div className="space-y-3">
              {formData.shipRoster.map((ship, index) => (
                <motion.div
                  key={index}
                  className="border border-[rgba(var(--mg-primary),0.2)] rounded p-4 bg-[rgba(var(--mg-panel-dark),0.3)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">SIZE</label>
                      <select
                        value={ship.size}
                        onChange={(e) => onUpdateShip(index, 'size', e.target.value as ShipSize)}
                        className="mg-input w-full text-sm"
                      >
                        {SHIP_SIZES.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">CATEGORY</label>
                      <select
                        value={ship.category}
                        onChange={(e) => onUpdateShip(index, 'category', e.target.value as ShipCategory)}
                        className="mg-input w-full text-sm"
                      >
                        {SHIP_CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">COUNT</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={ship.count}
                        onChange={(e) => onUpdateShip(index, 'count', parseInt(e.target.value) || 1)}
                        className="mg-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => onRemoveShip(index)}
                        className="mg-btn-icon text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)]"
                        title="Remove Ship"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[rgba(var(--mg-text),0.5)]">
              No ships specified. This template can be used for ground-only operations or click &quot;Add Ship&quot; to add vessels.
            </div>
          )}
        </div>
      </MobiGlasPanel>

      {/* Personnel Roster */}
      <MobiGlasPanel
        title="Personnel Roster"
        rightContent={
          <MobiGlasButton
            onClick={onAddPersonnel}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon />}
            withScanline={true}
          >
            Add Personnel
          </MobiGlasButton>
        }
      >
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            Specify the required personnel roles for this mission template.
          </div>

          {formData.personnelRoster && formData.personnelRoster.length > 0 ? (
            <div className="space-y-3">
              {formData.personnelRoster.map((personnel, index) => (
                <motion.div
                  key={index}
                  className="border border-[rgba(var(--mg-primary),0.2)] rounded p-4 bg-[rgba(var(--mg-panel-dark),0.3)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">PROFESSION</label>
                      <select
                        value={personnel.profession}
                        onChange={(e) => onUpdatePersonnel(index, 'profession', e.target.value as PersonnelProfession)}
                        className="mg-input w-full text-sm"
                      >
                        {PERSONNEL_PROFESSIONS.map((profession) => (
                          <option key={profession} value={profession}>{profession}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">COUNT</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={personnel.count}
                        onChange={(e) => onUpdatePersonnel(index, 'count', parseInt(e.target.value) || 1)}
                        className="mg-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => onRemovePersonnel(index)}
                        className="mg-btn-icon text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)]"
                        title="Remove Personnel"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[rgba(var(--mg-text),0.5)]">
              No personnel specified. Click &quot;Add Personnel&quot; to add required roles.
            </div>
          )}
        </div>
      </MobiGlasPanel>

      {/* Required Equipment */}
      <MobiGlasPanel title="Required Equipment">
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            List any specific equipment, gear, or supplies required for this mission type.
          </div>
          <div className="mg-input-group">
            <textarea
              value={formData.requiredEquipment || ''}
              onChange={(e) => onInputChange('requiredEquipment', e.target.value)}
              className="mg-input w-full h-32 resize-vertical"
              placeholder="e.g.&#10;Mining lasers&#10;Tractor beams&#10;Cargo containers&#10;Security armor&#10;Medical supplies"
              maxLength={2000}
            />
            <div className="text-xs text-[rgba(var(--mg-text),0.5)] mt-1">
              {(formData.requiredEquipment || '').length}/2000 characters
            </div>
          </div>
        </div>
      </MobiGlasPanel>

      {/* Action Buttons */}
      <MobiGlasPanel title="Actions">
        <div className="flex justify-end space-x-4">
          <MobiGlasButton
            onClick={onCancel}
            variant="secondary"
            size="md"
            disabled={isLoading}
          >
            Cancel
          </MobiGlasButton>
          <MobiGlasButton
            onClick={onSave}
            variant="primary"
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            withGlow={!isLoading}
          >
            {isEditing ? 'Update Template' : 'Save Template'}
          </MobiGlasButton>
        </div>
      </MobiGlasPanel>
    </div>
  );
};

export default MissionTemplateForm;