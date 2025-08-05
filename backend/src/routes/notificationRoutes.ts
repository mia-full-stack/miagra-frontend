import { Router } from "express"
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

console.log("🔔 Setting up notification routes...")

// Все маршруты требуют аутентификации
router.use(authenticateToken)

// Маршруты уведомлений
router.get("/", getNotifications)

// PUT /api/notifications/:notificationId/read - отметить как прочитанное
router.put("/:notificationId/read", markAsRead)

// PUT /api/notifications/mark-all-read - отметить все как прочитанные
router.put("/mark-all-read", markAllAsRead)

console.log("✅ Notification routes configured")

export default router







// import { Router } from "express"
// import {
//   getNotifications,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
//   getUnreadNotificationsCount,
//   deleteNotification,
// } from "../controllers/notificationController"
// import { authenticateToken } from "../middleware/auth"

// const router = Router()

// // Все маршруты требуют аутентификации
// router.use(authenticateToken)

// // Маршруты уведомлений
// router.get("/", getNotifications) // Получить все уведомления
// router.get("/unread-count", getUnreadNotificationsCount) // Получить количество непрочитанных
// router.put("/:notificationId/read", markNotificationAsRead) // Отметить как прочитанное
// router.put("/mark-all-read", markAllNotificationsAsRead) // Отметить все как прочитанные
// router.delete("/:notificationId", deleteNotification) // Удалить уведомление

// export default router
