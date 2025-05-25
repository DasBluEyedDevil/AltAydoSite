import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

interface MissionBasicInfoFormProps {
  formData: Partial<MissionResponse>;
  updateFormData: (key: keyof MissionResponse, value: any) => void;
}

const MissionBasicInfoForm: React.FC<MissionBasicInfoFormProps> = ({ 
  formData, 
  updateFormData 
}) => {
  const [tempImages, setTempImages] = useState<string[]>(formData.images || []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Format date for input
  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages = [...tempImages];
    
    for (const file of Array.from(files)) {
      try {
        // Validate file
        if (file.size > 5000000) { // 5MB limit
          setUploadError('File size exceeds 5MB limit');
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files are allowed');
          continue;
        }
        
        // Create FormData and upload
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/fleet-ops/operations/upload-image', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const { imageUrl } = await response.json();
        newImages.push(imageUrl);
        setUploadError(null);
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError('Error uploading image');
      }
    }
    
    setTempImages(newImages);
    updateFormData('images', newImages);
  };
  
  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...tempImages];
    newImages.splice(index, 1);
    setTempImages(newImages);
    updateFormData('images', newImages);
  };
  
  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section 1: Core Mission Details */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="mg-subtitle text-base font-quantify border-b border-[rgba(var(--mg-primary),0.3)] pb-2">
          Core Mission Details
        </h3>
        
        {/* Mission Name */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Name
          </label>
          <input 
            type="text"
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.name || ''}
            onChange={(e) => updateFormData('name', e.target.value)}
            required
          />
        </div>
        
        {/* Mission Type */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Type
          </label>
          <select 
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.type || 'Cargo Haul'}
            onChange={(e) => updateFormData('type', e.target.value)}
            required
          >
            <option value="Cargo Haul">Cargo Haul</option>
            <option value="Salvage Operation">Salvage Operation</option>
            <option value="Bounty Hunting">Bounty Hunting</option>
            <option value="Exploration">Exploration</option>
            <option value="Reconnaissance">Reconnaissance</option>
            <option value="Medical Support">Medical Support</option>
            <option value="Combat Patrol">Combat Patrol</option>
            <option value="Escort Duty">Escort Duty</option>
            <option value="Mining Expedition">Mining Expedition</option>
          </select>
        </div>
        
        {/* Schedule Date & Time */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Scheduled Date & Time
          </label>
          <div className="relative mg-datetime-wrapper">
            <input 
              type="datetime-local"
              className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={formData.scheduledDateTime ? formatDateForInput(formData.scheduledDateTime) : ''}
              onChange={(e) => updateFormData('scheduledDateTime', e.target.value ? new Date(e.target.value).toISOString() : null)}
              required
            />
            {/* MobiGlas date picker styling overlay */}
            <div className="absolute pointer-events-none inset-0 border-[1px] border-[rgba(var(--mg-primary),0.1)] rounded-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent"></div>
            </div>
          </div>
        </div>
        
        {/* Mission Status */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Status
          </label>
          <select 
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.status || 'Planning'}
            onChange={(e) => updateFormData('status', e.target.value)}
            required
          >
            <option value="Planning">Planning</option>
            <option value="Briefing">Briefing</option>
            <option value="In Progress">In Progress</option>
            <option value="Debriefing">Debriefing</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Mission Location */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Location
          </label>
          <input 
            type="text"
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.location || ''}
            onChange={(e) => updateFormData('location', e.target.value)}
          />
        </div>
      </motion.div>
      
      {/* Section 2: Mission Briefing & Visuals */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="mg-subtitle text-base font-quantify border-b border-[rgba(var(--mg-primary),0.3)] pb-2">
          Mission Briefing & Visuals
        </h3>
        
        {/* Brief Summary */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Brief Summary
          </label>
          <input 
            type="text"
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.briefSummary || ''}
            onChange={(e) => updateFormData('briefSummary', e.target.value)}
            placeholder="Short summary of the mission"
            maxLength={120}
          />
        </div>
        
        {/* Mission Details/Plan */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Details & Plan
          </label>
          <textarea 
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none min-h-[150px]"
            value={formData.details || ''}
            onChange={(e) => updateFormData('details', e.target.value)}
            placeholder="Detailed description of mission objectives, plans, and important information"
          />
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Images
          </label>
          
          {/* Upload button */}
          <div className="mg-input-file-wrapper relative mb-3">
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageUpload}
            />
            <div className="mg-button-outline py-2 px-4 w-full text-center border border-dashed border-[rgba(var(--mg-primary),0.4)] bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Images (Maps, Diagrams, Screenshots)</span>
            </div>
          </div>
          
          {/* Error message */}
          {uploadError && (
            <p className="text-sm text-[rgba(var(--mg-error),0.9)] mb-2">{uploadError}</p>
          )}
          
          {/* Image thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto">
            {tempImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="w-full aspect-video bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Mission image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-[rgba(var(--mg-panel-dark),0.8)] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-error),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MissionBasicInfoForm; 