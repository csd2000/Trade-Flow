import { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';

interface MarketSession {
  name: string;
  timezone: string;
  openHour: number;
  closeHour: number;
  isOpen: boolean;
  currentTime: string;
}

export default function MarketClock() {
  const [times, setTimes] = useState<{
    newYork: string;
    london: string;
    tokyo: string;
    sydney: string;
    utc: string;
  }>({
    newYork: '',
    london: '',
    tokyo: '',
    sydney: '',
    utc: ''
  });

  const [sessions, setSessions] = useState<MarketSession[]>([]);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      
      const formatTime = (tz: string) => {
        return now.toLocaleTimeString('en-US', { 
          timeZone: tz, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
      };

      const getHour = (tz: string) => {
        return parseInt(now.toLocaleTimeString('en-US', { 
          timeZone: tz, 
          hour: '2-digit',
          hour12: false 
        }));
      };

      const getDay = (tz: string) => {
        return now.toLocaleDateString('en-US', { 
          timeZone: tz, 
          weekday: 'short'
        });
      };

      const isWeekday = (tz: string) => {
        const day = getDay(tz);
        return !['Sat', 'Sun'].includes(day);
      };

      const nyTime = formatTime('America/New_York');
      const londonTime = formatTime('Europe/London');
      const tokyoTime = formatTime('Asia/Tokyo');
      const sydneyTime = formatTime('Australia/Sydney');
      const utcTime = formatTime('UTC');

      setTimes({
        newYork: nyTime,
        london: londonTime,
        tokyo: tokyoTime,
        sydney: sydneyTime,
        utc: utcTime
      });

      const nyHour = getHour('America/New_York');
      const londonHour = getHour('Europe/London');
      const tokyoHour = getHour('Asia/Tokyo');
      const sydneyHour = getHour('Australia/Sydney');

      setSessions([
        {
          name: 'NYSE/CME',
          timezone: 'America/New_York',
          openHour: 9,
          closeHour: 16,
          isOpen: isWeekday('America/New_York') && nyHour >= 9 && nyHour < 16,
          currentTime: nyTime
        },
        {
          name: 'Futures',
          timezone: 'America/New_York',
          openHour: 18,
          closeHour: 17,
          isOpen: isWeekday('America/New_York') && (nyHour >= 18 || nyHour < 17),
          currentTime: nyTime
        },
        {
          name: 'London',
          timezone: 'Europe/London',
          openHour: 8,
          closeHour: 16,
          isOpen: isWeekday('Europe/London') && londonHour >= 8 && londonHour < 16,
          currentTime: londonTime
        },
        {
          name: 'Tokyo',
          timezone: 'Asia/Tokyo',
          openHour: 9,
          closeHour: 15,
          isOpen: isWeekday('Asia/Tokyo') && tokyoHour >= 9 && tokyoHour < 15,
          currentTime: tokyoTime
        }
      ]);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-semibold text-slate-300">Market Sessions</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <p className="text-xs text-slate-500">New York</p>
          <p className="text-sm font-mono text-white">{times.newYork}</p>
        </div>
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <p className="text-xs text-slate-500">London</p>
          <p className="text-sm font-mono text-white">{times.london}</p>
        </div>
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <p className="text-xs text-slate-500">Tokyo</p>
          <p className="text-sm font-mono text-white">{times.tokyo}</p>
        </div>
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <p className="text-xs text-slate-500">UTC</p>
          <p className="text-sm font-mono text-amber-400">{times.utc}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sessions.map((session) => (
          <div 
            key={session.name}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
              session.isOpen 
                ? 'bg-green-900/40 border border-green-500/50 text-green-400' 
                : 'bg-slate-800/50 border border-slate-600/50 text-slate-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${session.isOpen ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
            <span>{session.name}</span>
            <span className={session.isOpen ? 'text-green-300' : 'text-slate-600'}>
              {session.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
