import { useQuery } from '@tanstack/react-query';
import { getContent } from '../services/contentService';

/**
 * Test component to verify React Query integration
 * Fetches content items and displays them with loading/error states
 */
function QueryTest() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content', { limit: 5 }],
    queryFn: () => getContent({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>React Query Test</h3>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>React Query Test</h3>
        <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>React Query Test</h3>
      <p>Successfully fetched {data?.items?.length || 0} content items</p>
      <button onClick={() => refetch()}>Refetch</button>

      {data?.items && data.items.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Content Items:</h4>
          <ul>
            {data.items.map((item) => (
              <li key={item.content_id}>
                {item.title} - {item.topic} ({item.difficulty_level})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>
          <strong>Note:</strong> Data is cached for 5 minutes (staleTime).
          Click "Refetch" to force a fresh fetch.
        </p>
      </div>
    </div>
  );
}

export default QueryTest;
