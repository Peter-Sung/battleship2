
import React, { useState, useEffect } from 'react';
import CalendarIcon from './icons/CalendarIcon';
import UsersIcon from './icons/UsersIcon';
import { supabase } from '../utils/supabase';

interface VisitorStats {
  cumulative: number;
  today: number;
}

const VisitorCounter: React.FC = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndIncrementStats = async () => {
      try {
        // Call the database function to handle incrementing and fetching atomically
        const { data, error: rpcError } = await supabase.rpc('increment_and_get_visitors');

        if (rpcError) {
          throw rpcError;
        }

        if (data && data.length > 0) {
          const result = data[0];
          setStats({
            cumulative: result.total_visitors,
            today: result.today_visitors,
          });
          setError(null);
        } else {
            // Handle cases where data is unexpectedly empty
            throw new Error("방문자 데이터가 없습니다.");
        }
      } catch (error: any) {
        console.error("Error fetching visitor stats:", error);
        setError("방문자 수를 불러올 수 없습니다.");
      }
    };
    
    fetchAndIncrementStats();
   
  }, []);

  if (error) {
    return (
       <div className="flex items-center gap-6 text-sm text-red-400">
         {error}
       </div>
    )
  }

  if (!stats) {
    return (
       <div className="flex items-center gap-6 text-sm text-gray-400 animate-pulse">
        <div className="flex items-center gap-2" title="오늘 방문자 수">
          <CalendarIcon className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold">TODAY</span>
          <span className="font-bold text-lg text-yellow-400">...</span>
        </div>
        <div className="flex items-center gap-2" title="누적 방문자 수">
          <UsersIcon className="w-5 h-5 text-cyan-500" />
          <span className="font-semibold">TOTAL</span>
          <span className="font-bold text-lg text-white">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm text-gray-400">
      <div className="flex items-center gap-2" title="오늘 방문자 수">
        <CalendarIcon className="w-5 h-5 text-yellow-400" />
        <span className="font-semibold">TODAY</span>
        <span className="font-bold text-lg text-yellow-400">{stats.today.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2" title="누적 방문자 수">
        <UsersIcon className="w-5 h-5 text-cyan-500" />
        <span className="font-semibold">TOTAL</span>
        <span className="font-bold text-lg text-white">{stats.cumulative.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default VisitorCounter;
