import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function SupabaseExample() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Example</h1>
      <p className="mb-4">This is an example of using Supabase in a server component.</p>
      
      <h2 className="text-xl font-semibold mb-2">Todos from Supabase:</h2>
      {todos && todos.length > 0 ? (
        <ul className="list-disc pl-5">
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title || JSON.stringify(todo)}</li>
          ))}
        </ul>
      ) : (
        <p>No todos found or table doesn't exist yet.</p>
      )}
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          Note: This example assumes you have a 'todos' table in your Supabase database.
          If you don't have this table yet, you can create it in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}