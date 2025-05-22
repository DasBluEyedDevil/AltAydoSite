'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AnnouncementData {
  id: number;
  title: string;
  content: string;
  date: string;
  important: boolean;
  category?: 'general' | 'express' | 'empyrion' | 'corporate';
}

interface EmployeeOfMonthData {
  name: string;
  username: string;
  position: string;
  achievement: string;
  image: string;
  subsidiary?: string;
}

// Sample announcements data
const announcementsData: AnnouncementData[] = [
  {
    id: 1,
    title: 'New Trade Routes Established',
    content: 'AydoExpress has established new trade routes through the Stanton system, with particular focus on Crusader-Microtech shipping lanes. These routes offer a 15% increase in profit margins compared to previous routes. All certified pilots will have access starting next week. Contact your supervisor for route details and clearance.',
    date: '2 days ago',
    important: true,
    category: 'express'
  },
  {
    id: 2,
    title: 'Empyrion Industries Expansion',
    content: 'Empyrion Industries is expanding operations to include salvage operations in the Aaron Halo. New equipment has been acquired and training sessions will begin next week. All Empyrion personnel are required to attend safety briefings before deployment.',
    date: '3 days ago',
    important: true,
    category: 'empyrion'
  },
  {
    id: 3,
    title: 'System Maintenance Notice',
    content: 'The communications system will undergo scheduled maintenance on Friday. Expect brief outages between 18:00-22:00 UTC. Emergency channels will remain operational. Please complete any pending communications before the maintenance window.',
    date: '4 days ago',
    important: false,
    category: 'corporate'
  },
  {
    id: 4,
    title: 'Fleet Week Registration Open',
    content: 'Registration for the upcoming Fleet Week event is now open. All personnel are encouraged to participate. AydoCorp will have a corporate booth showcasing our latest logistics capabilities. Sign up through your department supervisor by the end of the week.',
    date: '5 days ago',
    important: true,
    category: 'general'
  },
  {
    id: 5,
    title: 'Certification Program Updates',
    content: 'The certification program has been updated with new training modules for advanced logistics operations. All employees seeking promotion should review the new requirements. Contact the training department for more information.',
    date: '1 week ago',
    important: false,
    category: 'corporate'
  }
];

// Employee of the month data
const employeeOfMonth: EmployeeOfMonthData = {
  name: 'Sam Reynolds',
  username: 'Delta_Dart_42',
  position: 'AydoExpress Manager',
  achievement: 'Leading a successful rescue operation of a stranded cargo vessel in the Aaron Halo, saving both crew and valuable cargo worth over 500,000 UEC. The operation demonstrated exceptional leadership and logistics coordination under pressure.',
  image: '/images/AydoOffice1.png',
  subsidiary: 'AydoExpress'
};

const Announcements = () => {
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<number | null>(null);

  const toggleAnnouncement = (id: number) => {
    if (expandedAnnouncement === id) {
      setExpandedAnnouncement(null);
    } else {
      setExpandedAnnouncement(id);
    }
  };

  const getCategoryColorClass = (category?: string) => {
    switch (category) {
      case 'express':
        return 'border-[rgba(var(--mg-warning),0.7)]'; // Use warning for express
      case 'empyrion':
        return 'border-[rgba(var(--mg-danger),0.6)]'; // Use danger/accent for empyrion (orange-like)
      case 'corporate':
        return 'border-[rgba(var(--mg-secondary),0.7)]'; // Use secondary for corporate
      default:
        return 'border-[rgba(var(--mg-primary),0.7)]'; // Default to primary
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'express':
        return '/images/Aydo_Express.png';
      case 'empyrion':
        return '/images/Empyrion_Industries.png';
      case 'corporate':
        return '/images/Aydo_Corp_logo_Silver.png';
      default:
        return '/images/Aydo_Corp_logo_employees.png';
    }
  };

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
      
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="h-5 w-5 relative mr-2">
          <Image 
            src="/images/Aydo_Corp_logo_Gold.png" 
            alt="AydoCorp Announcements" 
            fill 
            className="object-contain"
          />
        </div>
        <h2 className="mg-title text-sm font-quantify tracking-wider">CORPORATE ANNOUNCEMENTS</h2>
      </div>
      
      {/* Announcements List */}
      <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {announcementsData.map((announcement) => (
          <motion.div 
            key={announcement.id}
            className={`border-l-2 ${getCategoryColorClass(announcement.category)} pl-3 cursor-pointer bg-[rgba(var(--mg-panel-dark),0.3)] hover:bg-[rgba(var(--mg-panel-dark),0.5)] transition-colors duration-200 rounded-r-sm`}
            onClick={() => toggleAnnouncement(announcement.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start p-2">
              <div className="flex items-start">
                <div className="h-4 w-4 relative mt-0.5 mr-2">
                  <Image 
                    src={getCategoryIcon(announcement.category)} 
                    alt={announcement.category || 'announcement'} 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="mg-subtitle text-sm flex items-center">
                    {announcement.important && (
                      <span className="inline-block w-2 h-2 bg-[rgba(var(--mg-accent),0.8)] rounded-full mr-2 shadow-[0_0_4px_rgba(var(--mg-accent),0.7)]"></span>
                    )}
                    {announcement.title}
                  </h3>
                  <p className="mg-text text-xs opacity-60 mt-0.5">{announcement.date}</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform text-[rgba(var(--mg-text),0.7)] ${expandedAnnouncement === announcement.id ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedAnnouncement === announcement.id && (
              <motion.div
                className="mt-1 mg-text text-sm opacity-90 p-2 pt-0"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                {announcement.content}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Employee of the Month */}
      <div className="border-t border-[rgba(var(--mg-primary),0.2)] pt-4">
        <div className="flex items-center mb-3">
          <div className="h-5 w-5 relative mr-2">
            <Image 
              src="/images/Board_member_tag.png" 
              alt="Employee Recognition" 
              fill 
              className="object-contain"
            />
          </div>
          <h3 className="mg-subtitle text-sm tracking-wider">EMPLOYEE OF THE MONTH</h3>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 bg-[rgba(var(--mg-panel-dark),0.3)] p-3 rounded-sm">
          <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-[rgba(var(--mg-primary),0.3)] shadow-md">
            <Image 
              src={employeeOfMonth.image}
              alt={employeeOfMonth.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--mg-panel-dark),0.7)] to-transparent"></div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-baseline">
              <h4 className="mg-title text-base">{employeeOfMonth.name}</h4>
              <span className="mg-text text-xs opacity-70 ml-2">({employeeOfMonth.username})</span>
            </div>
            <div className="flex items-center mt-1">
              <p className="mg-text text-xs opacity-90">{employeeOfMonth.position}</p>
              {employeeOfMonth.subsidiary && (
                <div className="flex items-center ml-3">
                  <div className="h-3.5 w-3.5 relative mr-1.5">
                    <Image 
                      src={employeeOfMonth.subsidiary === 'AydoExpress' ? getCategoryIcon('express') : getCategoryIcon('empyrion')} 
                      alt={employeeOfMonth.subsidiary} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <span className="mg-text text-xs opacity-70">{employeeOfMonth.subsidiary}</span>
                </div>
              )}
            </div>
            <p className="mg-text text-xs mt-2 leading-relaxed opacity-80">{employeeOfMonth.achievement}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements; 