import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Integration Example</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Todos from Supabase</h2>

        {todos && todos.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="text-gray-800">
                {todo.title || JSON.stringify(todo)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
              No todos found or table doesn't exist yet. You can create a 'todos' table in your Supabase dashboard.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How to use Supabase in your application</h3>
        <p className="text-blue-700 mb-2">
          This page demonstrates how to query data from Supabase in a server component.
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {`// Server Component
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function YourComponent() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Query your data
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
}`}
        </pre>
      </div>
    </div>
  );
}
