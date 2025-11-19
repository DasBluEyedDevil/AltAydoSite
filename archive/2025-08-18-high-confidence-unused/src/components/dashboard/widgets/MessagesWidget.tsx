'use client';

import { useState } from 'react';

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

export default function MessagesWidget() {
  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: 'System',
      content: 'Welcome back to your MobiGlas interface.',
      time: '10:23',
      read: true
    },
    {
      id: 2,
      sender: 'Admin',
      content: 'Your account has been upgraded to premium status.',
      time: '09:15',
      read: false
    },
    {
      id: 3,
      sender: 'Security',
      content: 'New login detected from your usual location.',
      time: 'Yesterday',
      read: false
    }
  ]);
  
  return (
    <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded-lg overflow-hidden h-full backdrop-blur-sm">
      <div className="border-b border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-primary),0.05)] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[rgba(var(--mg-primary),1)] font-medium">Messages</h3>
        <div className="text-xs text-[rgba(var(--mg-primary),0.7)] bg-[rgba(var(--mg-primary),0.1)] rounded-full px-2 py-0.5">
          {messages.filter(m => !m.read).length} unread
        </div>
      </div>
      
      <div className="divide-y divide-[rgba(var(--mg-primary),0.1)]">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-4 ${!message.read ? 'bg-[rgba(var(--mg-primary),0.05)]' : ''} hover:bg-[rgba(var(--mg-primary),0.1)] transition-colors cursor-pointer`}
          >
            <div className="flex justify-between mb-1">
              <div className="font-medium text-[rgba(var(--mg-primary),0.9)]">
                {message.sender}
                {!message.read && <span className="inline-block w-2 h-2 bg-[rgba(var(--mg-primary),1)] rounded-full ml-2"></span>}
              </div>
              <div className="text-xs text-gray-500">{message.time}</div>
            </div>
            <div className="text-sm text-gray-400 line-clamp-2">{message.content}</div>
          </div>
        ))}
      </div>
      
      <div className="p-2 bg-[rgba(var(--mg-primary),0.05)] border-t border-[rgba(var(--mg-primary),0.1)]">
        <button className="w-full py-2 text-sm text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)] transition-colors">
          View All Messages
        </button>
      </div>
    </div>
  );
} 