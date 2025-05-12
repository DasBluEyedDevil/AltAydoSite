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
}

interface EmployeeOfMonthData {
  name: string;
  username: string;
  position: string;
  achievement: string;
  image: string;
}

// Sample announcements data
const announcementsData: AnnouncementData[] = [
  {
    id: 1,
    title: 'New Trade Routes Established',
    content: 'AydoExpress has established new trade routes through the Stanton system. Routes will be available to all certified pilots starting next week.',
    date: '2 days ago',
    important: true
  },
  {
    id: 2,
    title: 'System Maintenance',
    content: 'The communications system will undergo maintenance on Friday. Expect brief outages between 18:00-22:00 UTC.',
    date: '3 days ago',
    important: false
  },
  {
    id: 3,
    title: 'Fleet Week Registration Open',
    content: 'Registration for the upcoming Fleet Week event is now open. All personnel are encouraged to participate. Sign up through your department supervisor.',
    date: '5 days ago',
    important: true
  }
];

// Employee of the month data
const employeeOfMonth: EmployeeOfMonthData = {
  name: 'Sam Reynolds',
  username: 'Delta_Dart_42',
  position: 'AydoExpress Manager',
  achievement: 'Leading a successful rescue operation of a stranded cargo vessel in the Aaron Halo, saving both crew and valuable cargo.',
  image: '/images/employee_month.jpg'
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

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
      
      {/* Header */}
      <h2 className="mg-title text-lg font-quantify mb-4">ANNOUNCEMENTS</h2>
      
      {/* Announcements List */}
      <div className="space-y-3 mb-6">
        {announcementsData.map((announcement) => (
          <motion.div 
            key={announcement.id}
            className={`border-l-2 ${announcement.important ? 'border-[rgba(var(--mg-primary),0.8)]' : 'border-[rgba(var(--mg-primary),0.4)]'} pl-3 cursor-pointer`}
            onClick={() => toggleAnnouncement(announcement.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold">
                  {announcement.important && (
                    <span className="inline-block w-2 h-2 bg-[rgba(var(--mg-primary),0.8)] rounded-full mr-1"></span>
                  )}
                  {announcement.title}
                </h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.6)]">{announcement.date}</p>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transform transition-transform ${expandedAnnouncement === announcement.id ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedAnnouncement === announcement.id && (
              <motion.div 
                className="mt-2 text-sm text-[rgba(var(--mg-text),0.8)]"
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
        <h3 className="mg-subtitle text-sm tracking-wider mb-3">EMPLOYEE OF THE MONTH</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0">
            <Image 
              src={employeeOfMonth.image}
              alt={employeeOfMonth.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          
          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-semibold">{employeeOfMonth.name}</h4>
              <span className="ml-2 text-xs text-[rgba(var(--mg-primary),0.8)]">({employeeOfMonth.username})</span>
            </div>
            <p className="text-xs text-[rgba(var(--mg-text),0.7)]">{employeeOfMonth.position}</p>
            <p className="text-xs mt-1">{employeeOfMonth.achievement}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements; 