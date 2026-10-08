import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAdminLogin } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();

  const loginMutation = useAdminLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    loginMutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          navigate("/admin/dashboard", {
            replace: true,
          });
        },
      },
    );
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-card__icon">
          <ShieldCheck size={28} />
        </div>

        <span className="eyebrow">
          مدیریت فروشگاه
        </span>

        <h1>خوش آمدید</h1>

        <p className="login-card__description">
          برای ورود به پنل مدیریت اطلاعات
          حساب خود را وارد کنید.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            ایمیل

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            رمز عبور

            <div className="password-input">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="رمز عبور"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
                aria-label={
                  showPassword
                    ? "مخفی کردن رمز"
                    : "نمایش رمز"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          {loginMutation.isError && (
            <div className="form-error-box">
              {loginMutation.error instanceof
              Error
                ? loginMutation.error.message
                : "ورود ناموفق بود."}
            </div>
          )}

          <button
            type="submit"
            className="primary-button login-button"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? "در حال ورود..."
              : "ورود به پنل"}
          </button>
        </form>
      </div>
    </section>
  );
}