Development notes — Backend-compatible envs and test flows

Email OTP testing

- To run the backend in a repeatable OTP test mode use these envs:

  FIXED_OTP=1234 FIXED_OTP_EMAIL=test@example.com npm run dev

  This will make OTPs fixed and predictable for E2E tests.

Mailer

- The backend supports SendGrid or SMTP for sending emails.
- Set `SENDGRID_API_KEY` and `SENDGRID_FROM` OR `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

Mediasoup

- The backend `MEDIASOUP_MODE` defaults to `stub`. To exercise real mediasoup transports set:

  MEDIASOUP_MODE=real

  When using `real` mode ensure the `mediasoup` package is installed and ports are open (you may need to set `MEDIASOUP_RTC_MIN_PORT` and `MEDIASOUP_RTC_MAX_PORT`).

E2E tests (Playwright)

1. Start backend in FIXED_OTP mode: `FIXED_OTP=1234 FIXED_OTP_EMAIL=test@example.com npm run dev` (in backend repo)
2. Start frontend: `npm run dev`
3. Install Playwright: `npm i -D @playwright/test && npx playwright install`
4. Run the example test: `npx playwright test e2e/playwright/login.spec.ts`

