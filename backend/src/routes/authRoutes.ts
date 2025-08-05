import { Router } from "express"
import { register, login} from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authenticateToken)

export default router


// import { Router } from "express"
// import { register, login, getMe, updatePassword, logout } from "../controllers/authController"
// import { authenticateToken } from "../middleware/auth"

// const router = Router()

// // Публичные маршруты (не требуют аутентификации)
// router.post("/register", register)
// router.post("/login", login)

// // Защищенные маршруты (требуют аутентификации)
// router.get("/me", authenticateToken, getMe)
// router.put("/password", authenticateToken, updatePassword)
// router.post("/logout", authenticateToken, logout)

// export default router
