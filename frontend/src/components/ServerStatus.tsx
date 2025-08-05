"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface ServerStatusProps {
  className?: string;
}

export default function ServerStatus({ className = "" }: ServerStatusProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkServerStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
        {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        }
      );

      setIsOnline(response.ok);
      setLastCheck(new Date());
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkServerStatus();

    // Проверяем статус каждые 30 секунд
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking server...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">Server Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">Server Offline</span>
          </>
        )}
      </div>

      <button
        onClick={checkServerStatus}
        disabled={checking}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Refresh server status"
      >
        <RefreshCw
          className={`w-3 h-3 text-gray-400 ${checking ? "animate-spin" : ""}`}
        />
      </button>

      {lastCheck && (
        <span className="text-xs text-gray-400">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
