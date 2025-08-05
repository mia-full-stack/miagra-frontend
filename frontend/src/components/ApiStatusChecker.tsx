"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { checkApiStatus } from "../utils/api-status";

export default function ApiStatusChecker() {
  const [status, setStatus] = useState<{
    isAvailable: boolean;
    message: string;
    serverInfo?: any;
    checking: boolean;
  }>({
    isAvailable: false,
    message: "Проверка соединения...",
    checking: true,
  });

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkApiStatus();
    setStatus({
      ...result,
      checking: false,
    });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
          status.isAvailable
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {status.checking ? (
          <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
        ) : status.isAvailable ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}

        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              status.isAvailable ? "text-green-800" : "text-red-800"
            }`}
          >
            {status.isAvailable
              ? "API сервер доступен"
              : "API сервер недоступен"}
          </p>
          <p className="text-xs text-gray-600">{status.message}</p>
          {status.serverInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {status.serverInfo.status}: {status.serverInfo.message}
            </p>
          )}
        </div>

        <button
          onClick={checkStatus}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          disabled={status.checking}
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-500 ${
              status.checking ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
