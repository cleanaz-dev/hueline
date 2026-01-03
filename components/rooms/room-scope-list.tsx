'use client';
import { useEffect, useState } from 'react';
import { DatabaseZap, MicOffIcon } from 'lucide-react';

interface Scope {
  category: string;
  title: string;
  action: string;
  timestamp: string;
}

interface ScopeListProps {
  slug: string;
  roomId: string;
}

export default function ScopeList({ slug, roomId }: ScopeListProps) {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/subdomain/${slug}/room/${roomId}/scope-stream`
    );
    
    eventSource.onopen = () => {
      console.log('✅ Connected to scope updates');
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      console.log('📩 New scope received:', event.data);
      const newScope = JSON.parse(event.data);
      setScopes(prev => [...prev, newScope]);
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [slug, roomId]);

  return (
    <div className="hidden lg:flex lg:flex-col lg:flex-1 gap-2 overflow-y-auto mt-4">
      <div className="flex justify-between items-end mb-1">
        <div className="text-xs font-semibold text-muted-foreground">INTEL</div>
        <div className="text-[10px] text-white/30">{scopes.length} items</div>
      </div>
     
      {scopes.length > 0 ? (
        scopes.map((scope, i) => (
          <div 
            key={i} 
            className="bg-muted/50 rounded-md p-2 text-xs border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="text-primary font-mono font-bold text-[10px] mb-1 flex gap-2 items-center uppercase tracking-wider">
              <DatabaseZap className="size-3 text-primary" />
              {scope.category}
            </div>
            <div className="text-black font-medium">{scope.title}</div>
            <div className="text-muted-foreground font-semibold">
              {scope.action}
            </div>
            <div className="text-black/30 text-[10px] mt-1 font-mono">
              {new Date(scope.timestamp).toLocaleString()}
            </div>
          </div>
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center space-y-2">
          <MicOffIcon className="size-8 text-muted-foreground" />
          <p className="text-xs">No items captured.</p>
          <p className="text-[10px]">Turn on 'Record' to start capturing scope.</p>
        </div>
      )}
    </div>
  );
}