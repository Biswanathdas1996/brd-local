import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LLMStatus {
  connected: boolean;
  endpoint: string;
  model: string;
  message: string;
}

export default function LLMStatus() {
  const { data: status, isLoading } = useQuery<LLMStatus>({
    queryKey: ["/api/llm-status"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Alert className="mb-4 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" data-testid="alert-llm-status-loading">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" data-testid="icon-status-loading" />
        <AlertDescription className="ml-2 text-gray-700 dark:text-gray-300" data-testid="text-status-loading">
          Checking LLM service status...
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Alert 
      className={`mb-4 ${
        status.connected 
          ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800" 
          : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800"
      }`}
      data-testid="alert-llm-status"
    >
      {status.connected ? (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" data-testid="icon-status-connected" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" data-testid="icon-status-disconnected" />
      )}
      <AlertDescription 
        className={`ml-2 ${
          status.connected 
            ? "text-green-800 dark:text-green-200" 
            : "text-red-800 dark:text-red-200"
        }`}
        data-testid="text-status-message"
      >
        <span className="font-semibold">
          {status.connected ? "LLM Connected" : "LLM Disconnected"}
        </span>
        {" - "}
        <span className="text-sm">
          {status.model} @ {status.endpoint}
        </span>
        {!status.connected && (
          <span className="block text-xs mt-1" data-testid="text-error-message">
            {status.message}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
