"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Server } from "lucide-react";
import styles from "./login.module.css";
import ApiStatusChecker from "../../components/ApiStatusChecker";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const { login, user, apiError } = useAuth();
  const router = useRouter();

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Валидация email в реальном времени
  useEffect(() => {
    if (touchedFields.has("email") && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else if (touchedFields.has("email") && !email) {
      setEmailError("Email is required");
    }
  }, [email, touchedFields]);

  // Отображаем ошибку API, если она есть
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Очищаем общую ошибку при изменении email
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Очищаем общую ошибку при изменении пароля
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => new Set(prev).add(name));
  };

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && password && emailRegex.test(email) && !emailError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Отмечаем все поля как touched для показа ошибок
    setTouchedFields(new Set(["email", "password"]));

    if (!isFormValid()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Не показываем форму, если пользователь уже авторизован
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.formWrapper}>
            <h1 className={styles.logo}>Miagra</h1>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className={styles.inputGroup}>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    emailError && touchedFields.has("email")
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="Phone number, username, or email"
                  autoComplete="email"
                />
                {emailError && touchedFields.has("email") && (
                  <div className={styles.fieldError}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className={styles.inputGroup}>
                <div className={styles.passwordContainer}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handleBlur}
                    className={`${styles.input} ${styles.passwordInput} ${
                      touchedFields.has("password") && !password
                        ? styles.inputError
                        : ""
                    }`}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {touchedFields.has("password") && !password && (
                  <div className={styles.fieldError}>
                    <AlertCircle className="w-4 h-4" />
                    <span>Password is required</span>
                  </div>
                )}
              </div>

              {error && (
                <div className={styles.error}>
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`${styles.submitButton} ${
                  !isFormValid() ? styles.submitButtonDisabled : ""
                }`}
              >
                {loading && <span className={styles.loadingSpinner}></span>}
                Log in
              </button>
            </form>

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
          </div>

          <div className={styles.signupWrapper}>
            <p className={styles.signupText}>
              Don't have an account?{" "}
              <Link href="/register" className={styles.signupLink}>
                Sign up
              </Link>
            </p>
          </div>

          {/* Кнопка возврата на главную */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </Link>
            {/* Добавляем компонент проверки статуса API */}
            <div>
              <ApiStatusChecker />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
