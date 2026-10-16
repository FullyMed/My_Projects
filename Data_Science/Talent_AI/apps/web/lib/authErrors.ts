import type { AuthError } from "@supabase/supabase-js";

/** Turn a Supabase Auth error into a sentence for the login/signup forms.
 * Supabase's own messages ("Invalid login credentials", or a weak-password
 * message that lists every allowed character) aren't written for our users,
 * so each known code gets its own line. Add a case here rather than showing
 * `error.message` directly. */
export function friendlyAuthError(error: AuthError, action: "log in" | "sign up"): string {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Confirm your email first. We sent you a link when you signed up.";
    case "user_already_exists":
    case "email_exists":
      return "There's already an account with that email. Try logging in instead.";
    case "weak_password":
      return "Choose a stronger password: at least 8 characters, mixing upper and lower case letters, numbers and symbols.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts in a short time. Wait a few minutes and try again.";
  }
  // AuthRetryableFetchError: the request never reached Supabase.
  if (error.name === "AuthRetryableFetchError") {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return action === "log in"
    ? "We couldn't log you in. Try again in a moment."
    : "We couldn't create your account. Try again in a moment.";
}
