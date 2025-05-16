# Supabase Integration Guide

This guide explains how to use Supabase in the application for database operations and authentication.

## Setup

The application is configured to use Supabase for database operations. The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_KEY=your-anon-key
```

These are already set up in the `.env.local` file.

## Database Schema

The application expects the following tables in your Supabase database:

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  aydo_handle TEXT UNIQUE NOT NULL,
  discord_name TEXT,
  rsi_account_name TEXT,
  password_hash TEXT NOT NULL,
  clearance_level INTEGER DEFAULT 1,
  role TEXT DEFAULT 'member',
  image TEXT
);
```

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  organization TEXT,
  user_type TEXT
);
```

## Using Supabase in Server Components

```tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function YourServerComponent() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Query data
  const { data } = await supabase
    .from('your_table')
    .select('*');

  // Handle the data
  return (
    <div>
      {data && data.map(item => (
        <div key={item.id}>{JSON.stringify(item)}</div>
      ))}
    </div>
  );
}
```

## Using Supabase in Client Components

```tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export default function YourClientComponent() {
  const [data, setData] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setData(data);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      {data && data.map(item => (
        <div key={item.id}>{JSON.stringify(item)}</div>
      ))}
    </div>
  );
}
```

## Authentication

The application uses NextAuth.js for authentication, which is configured to use Supabase as the database provider. The authentication flow is as follows:

1. User enters credentials (aydoHandle and password)
2. NextAuth.js checks the credentials against the Supabase database
3. If valid, a session is created and the user is logged in

## Example Page

Visit `/supabase-example` to see a working example of Supabase integration.
