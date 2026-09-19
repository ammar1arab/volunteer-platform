import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const email = argValue("--email");

  if (!email) {
    console.error("Usage: npm run otp -- --email user@example.com");
    process.exit(1);
  }

  const [{ default: OtpUseCase }, { default: EmailUseCase }, { default: SystemLogUseCase }] =
    await Promise.all([
      import("@/core/application/useCases/OtpUseCase"),
      import("@/core/application/useCases/EmailUseCase"),
      import("@/core/application/useCases/SystemLogUseCase"),
    ]);

  const [
    { default: OtpRepository },
    { default: UserRepository },
    { default: PendingRegistrationRepository },
    { default: SystemLogRepository },
  ] = await Promise.all([
    import("@/infrastructure/persistence/repositories/OtpRepository/OtpRepository"),
    import("@/infrastructure/persistence/repositories/UserRepository/UserRepository"),
    import(
      "@/infrastructure/persistence/repositories/PendingRegistrationRepository/PendingRegistrationRepository"
    ),
    import("@/infrastructure/persistence/repositories/SystemLogRepository/SystemLogRepository"),
  ]);

  const otp = new OtpUseCase(
    new OtpRepository(),
    new UserRepository(),
    new EmailUseCase(new UserRepository()),
    new PendingRegistrationRepository(),
    new SystemLogUseCase(new SystemLogRepository())
  );

  const result = await otp.issueSupport(email);

  if (!result.success) {
    console.error(result.error.message);
    process.exit(1);
  }

  console.log(`Support OTP for ${email.trim().toLowerCase()}`);
  console.log(result.data.code);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Failed to issue support OTP");
  process.exit(1);
});
