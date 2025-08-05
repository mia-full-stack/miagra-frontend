"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Check, X, AlertCircle, Server } from "lucide-react"
import styles from "./page.module.css"
import ApiStatusChecker from "../../components/ApiStatusChecker"

interface FormData {
  username: string
  email: string
  password: string
  fullName: string
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  fullName?: string
}

interface PasswordRequirements {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    fullName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const { register, user, apiError } = useAuth()
  const router = useRouter()

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  // Валидация в реальном времени
  useEffect(() => {
    validateForm()
  }, [formData])

  // Отображаем ошибку API, если она есть
  useEffect(() => {
    if (apiError) {
      setError(apiError)
    }
  }, [apiError])

  const validateForm = () => {
    const errors: ValidationErrors = {}

    // Валидация имени
    if (touchedFields.has("fullName") && formData.fullName.trim()) {
      if (formData.fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters"
      } else if (formData.fullName.trim().length > 50) {
        errors.fullName = "Full name must be less than 50 characters"
      } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
        errors.fullName = "Full name can only contain letters and spaces"
      }
    }

    // Валидация username
    if (touchedFields.has("username") && formData.username) {
      if (formData.username.length < 3) {
        errors.username = "Username must be at least 3 characters"
      } else if (formData.username.length > 30) {
        errors.username = "Username must be less than 30 characters"
      } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
        errors.username = "Username can only contain letters, numbers, dots, and underscores"
      } else if (formData.username.startsWith(".") || formData.username.endsWith(".")) {
        errors.username = "Username cannot start or end with a dot"
      } else if (formData.username.includes("..")) {
        errors.username = "Username cannot contain consecutive dots"
      }
    }

    // Валидация email
    if (touchedFields.has("email") && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address"
      }
    }

    // Валидация пароля и обновление требований
    if (formData.password) {
      const requirements = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      }
      setPasswordRequirements(requirements)

      if (touchedFields.has("password")) {
        if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters"
        } else if (!requirements.uppercase || !requirements.lowercase || !requirements.number) {
          errors.password = "Password must contain uppercase, lowercase, and number"
        }
      }
    }

    setValidationErrors(errors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("") // Очищаем общую ошибку при изменении полей
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouchedFields((prev) => new Set(prev).add(name))
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim().length >= 2 &&
      formData.username.length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8 &&
      passwordRequirements.uppercase &&
      passwordRequirements.lowercase &&
      passwordRequirements.number &&
      Object.keys(validationErrors).length === 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Отмечаем все поля как touched для показа ошибок
    setTouchedFields(new Set(["fullName", "username", "email", "password"]))

    if (!isFormValid()) {
      setError("Please fix the errors above")
      return
    }

    setLoading(true)
    setError("")

    try {
      await register(formData)
      router.push("/")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Не показываем форму, если пользователь уже авторизован
  if (user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.formWrapper}>
          <h1 className={styles.logo}>Miagra</h1>
          <p className={styles.subtitle}>Sign up to see photos and videos from your friends.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputContainer}>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    validationErrors.email && touchedFields.has("email") ? styles.inputError : ""
                  } ${
                    formData.email && !validationErrors.email && touchedFields.has("email") ? styles.inputSuccess : ""
                  }`}
                  placeholder="Email"
                  autoComplete="email"
                />
                {formData.email && touchedFields.has("email") && (
                  <div className={styles.validationIcon}>
                    {validationErrors.email ? (
                      <X className={styles.errorIcon} />
                    ) : (
                      <Check className={styles.successIcon} />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.email && touchedFields.has("email") && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIconSmall} />
                  <span>{validationErrors.email}</span>
                </div>
              )}
            </div>

            {/* Full Name Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputContainer}>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    validationErrors.fullName && touchedFields.has("fullName") ? styles.inputError : ""
                  } ${
                    formData.fullName && !validationErrors.fullName && touchedFields.has("fullName")
                      ? styles.inputSuccess
                      : ""
                  }`}
                  placeholder="Full Name"
                  autoComplete="name"
                />
                {formData.fullName && touchedFields.has("fullName") && (
                  <div className={styles.validationIcon}>
                    {validationErrors.fullName ? (
                      <X className={styles.errorIcon} />
                    ) : (
                      <Check className={styles.successIcon} />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.fullName && touchedFields.has("fullName") && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIconSmall} />
                  <span>{validationErrors.fullName}</span>
                </div>
              )}
            </div>

            {/* Username Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputContainer}>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    validationErrors.username && touchedFields.has("username") ? styles.inputError : ""
                  } ${
                    formData.username && !validationErrors.username && touchedFields.has("username")
                      ? styles.inputSuccess
                      : ""
                  }`}
                  placeholder="Username"
                  autoComplete="username"
                />
                {formData.username && touchedFields.has("username") && (
                  <div className={styles.validationIcon}>
                    {validationErrors.username ? (
                      <X className={styles.errorIcon} />
                    ) : (
                      <Check className={styles.successIcon} />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.username && touchedFields.has("username") && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIconSmall} />
                  <span>{validationErrors.username}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <div className={styles.inputContainer}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${styles.passwordInput} ${
                    validationErrors.password && touchedFields.has("password") ? styles.inputError : ""
                  } ${
                    formData.password && !validationErrors.password && touchedFields.has("password")
                      ? styles.inputSuccess
                      : ""
                  }`}
                  placeholder="Password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                  {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                </button>
                {formData.password && touchedFields.has("password") && (
                  <div className={styles.validationIcon}>
                    {validationErrors.password ? (
                      <X className={styles.errorIcon} />
                    ) : (
                      <Check className={styles.successIcon} />
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements - показываем только если есть пароль */}
              {formData.password && (
                <div className={styles.passwordRequirements}>
                  <div className={styles.requirementsTitle}>Password must contain:</div>
                  <div className={styles.requirementsGrid}>
                    <div
                      className={`${styles.requirement} ${passwordRequirements.length ? styles.requirementMet : ""}`}
                    >
                      {passwordRequirements.length ? (
                        <Check className={styles.reqIcon} />
                      ) : (
                        <X className={styles.reqIcon} />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`${styles.requirement} ${passwordRequirements.uppercase ? styles.requirementMet : ""}`}
                    >
                      {passwordRequirements.uppercase ? (
                        <Check className={styles.reqIcon} />
                      ) : (
                        <X className={styles.reqIcon} />
                      )}
                      <span>Uppercase</span>
                    </div>
                    <div
                      className={`${styles.requirement} ${passwordRequirements.lowercase ? styles.requirementMet : ""}`}
                    >
                      {passwordRequirements.lowercase ? (
                        <Check className={styles.reqIcon} />
                      ) : (
                        <X className={styles.reqIcon} />
                      )}
                      <span>Lowercase</span>
                    </div>
                    <div
                      className={`${styles.requirement} ${passwordRequirements.number ? styles.requirementMet : ""}`}
                    >
                      {passwordRequirements.number ? (
                        <Check className={styles.reqIcon} />
                      ) : (
                        <X className={styles.reqIcon} />
                      )}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}

              {validationErrors.password && touchedFields.has("password") && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIconSmall} />
                  <span>{validationErrors.password}</span>
                </div>
              )}
            </div>

            <p className={styles.infoText}>
              People who use our service may have uploaded your contact information to Miagra.{" "}
              <Link href="#" className={styles.learnMore}>
                Learn More
              </Link>
            </p>

            <p className={styles.termsText}>
              By signing up, you agree to our{" "}
              <Link href="#" className={styles.termsLink}>
                Terms
              </Link>
              ,{" "}
              <Link href="#" className={styles.termsLink}>
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="#" className={styles.termsLink}>
                Cookies Policy
              </Link>
              .
            </p>

            {error && (
              <div className={styles.error}>
                <div className={styles.errorContent}>
                  <Server className={styles.errorIconSmall} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`${styles.submitButton} ${!isFormValid() ? styles.submitButtonDisabled : ""}`}
            >
              {loading && <span className={styles.loadingSpinner}></span>}
              Sign up
            </button>
          </form>
        </div>

        <div className={styles.loginWrapper}>
          <p className={styles.loginText}>
            Have an account?{" "}
            <Link href="/login" className={styles.loginLink}>
              Log in
            </Link>
          </p>
        </div>

        <div className={styles.backToHome}>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </div>

      <ApiStatusChecker />
    </div>
  )
}
