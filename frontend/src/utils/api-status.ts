/**
 * Утилита для проверки доступности API
 */

export async function checkApiStatus(): Promise<{
  isAvailable: boolean;
  message: string;
  serverInfo?: any;
}> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Устанавливаем короткий таймаут для быстрой проверки
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        isAvailable: false,
        message: `API недоступен. Статус: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      isAvailable: true,
      message: "API доступен",
      serverInfo: data,
    };
  } catch (error: any) {
    console.error("Ошибка при проверке API:", error);

    // Определяем тип ошибки для более информативного сообщения
    let errorMessage = "Не удалось подключиться к серверу API";

    if (error.name === "AbortError") {
      errorMessage = "Превышено время ожидания ответа от сервера";
    } else if (error.message.includes("Failed to fetch")) {
      errorMessage = "Сервер API не запущен или недоступен";
    } else if (error.message.includes("NetworkError")) {
      errorMessage = "Проблема с сетевым подключением";
    }

    return {
      isAvailable: false,
      message: errorMessage,
    };
  }
}
