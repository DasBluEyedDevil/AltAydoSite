import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

interface ImageUpload {
  id: string;
  url: string;
  filename: string;
}

interface MissionBasicInfoFormProps {
  formData: MissionResponse;
  updateFormData: (field: string, value: any) => void;
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
    
    setUploadError(null); // Clear previous errors
    const newImages = [...tempImages];
    
    for (const file of Array.from(files)) {
      try {
        console.log(`Uploading image: ${file.name} (${file.size} bytes)`);
        
        // Validate file size before upload
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setUploadError('Image size exceeds the 5MB limit');
          continue;
        }
        
        // Create FormData and upload
        const uploadData = new FormData();
        uploadData.append('image', file);
        uploadData.append('missionId', formData.id || 'temp-' + Date.now());
        
        const response = await fetch('/api/fleet-ops/operations/upload-image', {
          method: 'POST',
          body: uploadData
        });

        if (!response.ok) {
          // Try to get more detailed error information
          let errorMessage = 'Failed to upload image';
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || `Upload failed (${response.status})`;
          } catch (jsonError) {
            errorMessage = `Upload failed (${response.status})`;
          }
          
          console.error('Image upload error:', errorMessage);
          setUploadError(errorMessage);
          continue;
        }

        const result = await response.json();
        console.log('Upload success:', result);
        
        // Add the new image URL to the temporary images array
        const imageUrl = `/api/fleet-ops/operations/images/${result.data.imageId}`;
        newImages.push(imageUrl);
        console.log('Added image URL to form data:', imageUrl);

      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      }
    }
    
    setTempImages(newImages);
    updateFormData('images', newImages);
    
    // Clear the file input
    e.target.value = '';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <motion.div className="space-y-4">
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
          
          {/* Image upload section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgba(var(--mg-primary),0.9)]">
              Mission Images
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="mission-image-input"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="mission-image-input"
                className="mg-button-outline py-2 px-4 text-sm inline-flex items-center cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload Images
              </label>
              <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                Max 5MB per image
              </span>
            </div>
            
            {/* Error message */}
            {uploadError && (
              <div className="mt-2 text-[rgba(var(--mg-error),1)] text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {uploadError}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {tempImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="w-full aspect-video bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm overflow-hidden">
                    <Image 
                      src={imageUrl} 
                      alt={`Mission image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
    </motion.div>
  );
};

export default MissionBasicInfoForm;