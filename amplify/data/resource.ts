import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User model based on UserProfile interface
  User: a
    .model({
      id: a.id(), // Primary key
      name: a.string(),
      handle: a.string(),
      aydoHandle: a.string().required(),
      email: a.string().required(),
      passwordHash: a.string().required(),
      clearanceLevel: a.integer().required(),
      role: a.string().required(),
      discordName: a.string(),
      rsiAccountName: a.string(),
      photo: a.string(),
      subsidiary: a.string(),
      payGrade: a.string(),
      position: a.string(),
      timezone: a.string(),
      preferredGameplayLoops: a.string().array(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      // Relationships
      messages: a.hasMany('Message', 'user'),
      announcements: a.hasMany('Announcement', 'user'),
      events: a.hasMany('Event', 'user'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Message model based on Message interface
  Message: a
    .model({
      sender: a.string(),
      content: a.string(),
      time: a.string(),
      read: a.boolean(),
      // Relationships
      user: a.belongsTo('User', 'user'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Event model based on EventData interface
  Event: a
    .model({
      title: a.string(),
      date: a.string(), // Using string for date to simplify
      time: a.string(),
      type: a.enum(['general', 'express', 'empyrion']),
      description: a.string(),
      // Relationships
      user: a.belongsTo('User', 'user'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Announcement model based on AnnouncementData interface
  Announcement: a
    .model({
      title: a.string(),
      content: a.string(),
      date: a.string(),
      important: a.boolean(),
      category: a.enum(['general', 'express', 'empyrion', 'corporate']),
      // Relationships
      user: a.belongsTo('User', 'user'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // EmployeeOfMonth model based on EmployeeOfMonthData interface
  EmployeeOfMonth: a
    .model({
      name: a.string(),
      username: a.string(),
      position: a.string(),
      achievement: a.string(),
      image: a.string(),
      subsidiary: a.string(),
      // Relationships
      user: a.belongsTo('User', 'user'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Keep the existing Todo model
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
