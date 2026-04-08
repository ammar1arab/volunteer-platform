# File Tree: volunteer-platform

**Generated:** 4/4/2026, 10:57:58 AM
**Root Path:** `c:\Projects\CMP\volunteer-platform`

```
├── 📁 .claude
│   └── ⚙️ settings.local.json
├── 📁 prisma
│   ├── 📁 migrations
│   │   ├── 📁 20251215183825_init
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20251218135408_add_featured_posts
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260210054156_add_out_of_jordan_city
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260210085539_add_featured_post_categories
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260217090505_volunteer_spotlight_table
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260217091637_add_isactive_volunteerspotlight
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260225053827_new_model_monthly_magazine
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260225094632_add_some_categories
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260310081648_activity_system_upgrade
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260314100322_add_certificates_notifications
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260318000000_add_published_at_featured_post
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260318100000_add_deleted_at_activity
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260318120000_otp_and_admin_permissions
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260323000001_otp_attempts_pending_reg
│   │   │   └── 📄 migration.sql
│   │   └── ⚙️ migration_lock.toml
│   └── 📄 schema.prisma
├── 📁 public
│   ├── 📁 fonts
│   │   ├── 📄 Cairo-Bold.ttf
│   │   └── 📄 Cairo-Regular.ttf
│   ├── 📁 icons
│   │   ├── 🖼️ badge-72.png
│   │   ├── 🖼️ badge-96.png
│   │   └── 🖼️ icon-192.png
│   ├── 📁 images
│   │   ├── 🖼️ about.jpg
│   │   ├── 🖼️ logo.png
│   │   └── 🖼️ og-preview.jpg
│   ├── ⚙️ .gitkeep
│   ├── 🖼️ apple-touch-icon.png
│   ├── 🖼️ favicon-16x16.png
│   ├── 🖼️ favicon-32x32.png
│   ├── 📄 favicon.ico
│   ├── 📄 robots.txt
│   ├── ⚙️ sitemap-0.xml
│   ├── ⚙️ sitemap.xml
│   └── 📄 sw.js
├── 📁 scripts
│   ├── 📄 set-superadmin.sql
│   └── 📄 test-cert.ts
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 (auth)
│   │   │   ├── 📁 forgot-password
│   │   │   │   ├── 📄 page.logic.ts
│   │   │   │   ├── 🎨 page.module.scss
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 signin
│   │   │   │   ├── 📄 page.logic.ts
│   │   │   │   ├── 🎨 page.module.scss
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 signup
│   │   │   │   ├── 📄 page.logic.ts
│   │   │   │   ├── 🎨 page.module.scss
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 verify-email
│   │   │   │   ├── 📄 page.logic.ts
│   │   │   │   ├── 🎨 page.module.scss
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 🎨 layout.module.scss
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 (public)
│   │   │   ├── 📁 about
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 activities
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 contact
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 magazines
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 posts
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 spotlight
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 verify
│   │   │   │   └── 📁 [certificateId]
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📁 volunteer
│   │   │   │   ├── 📁 activities
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 certificates
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 profile
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 admin
│   │   │   ├── 📁 dashboard
│   │   │   │   ├── 📁 activities
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 emails
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 featured-posts
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 monthly-magazine
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 notifications
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 permissions
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 requests
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 users
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 volunteer-spotlight
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 📄 layout.client.tsx
│   │   │   ├── 🎨 layout.module.scss
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 api
│   │   │   ├── 📁 activities
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 cancel
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 complete
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 publish
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 restore
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 volunteers
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 activity-participations
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 approve
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 cancel
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 mark-attendance
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📁 reject
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 bulk-mark-attendance
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 my-requests
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 pending
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📁 [...nextauth]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 check-email
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 check-otp
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 check-verified
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 forgot-password
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 register
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 reset-password
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 send-otp
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 signin
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 verify-otp
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 certificates
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 chat
│   │   │   │   ├── 📄 route.ts
│   │   │   │   └── 📄 systemPrompt.ts
│   │   │   ├── 📁 contact
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 download
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 emails
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 featured-posts
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 inngest
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 monthly-magazines
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 notifications
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📁 read
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 broadcasts
│   │   │   │   │   └── 📁 [broadcastId]
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 read-all
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 push
│   │   │   │   ├── 📁 subscribe
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 test
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 unsubscribe
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 sentry-example-api
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 uploads
│   │   │   │   ├── 📁 [scope]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 magazines
│   │   │   │       └── 📁 presign
│   │   │   │           └── 📄 route.ts
│   │   │   ├── 📁 users
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 activities
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 me
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 volunteer-profile
│   │   │   │   ├── 📁 picture
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 volunteer-spotlight
│   │   │       ├── 📁 [id]
│   │   │       │   └── 📄 route.ts
│   │   │       └── 📄 route.ts
│   │   ├── 📁 sentry-example-page
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 global-error.tsx
│   │   ├── 📄 layout.tsx
│   │   └── 📄 providers.tsx
│   ├── 📁 core
│   │   ├── 📁 application
│   │   │   ├── 📁 common
│   │   │   │   ├── 📄 errors.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 validation.ts
│   │   │   │   └── 📄 validators.ts
│   │   │   ├── 📁 dtos
│   │   │   │   ├── 📄 activity.dto.ts
│   │   │   │   ├── 📄 auth.dto.ts
│   │   │   │   ├── 📄 base.dto.ts
│   │   │   │   ├── 📄 certificate.dto.ts
│   │   │   │   ├── 📄 email.dto.ts
│   │   │   │   ├── 📄 featuredPost.dto.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 monthlyMagazine.dto.ts
│   │   │   │   ├── 📄 notification.dto.ts
│   │   │   │   ├── 📄 otp.dto.ts
│   │   │   │   ├── 📄 participation.dto.ts
│   │   │   │   ├── 📄 shared.dto.ts
│   │   │   │   ├── 📄 user.dto.ts
│   │   │   │   ├── 📄 volunteerProfile.dto.ts
│   │   │   │   └── 📄 volunteerSpotlight.dto.ts
│   │   │   ├── 📁 mappers
│   │   │   │   ├── 📄 activity.mapper.ts
│   │   │   │   ├── 📄 certificate.mapper.ts
│   │   │   │   ├── 📄 featuredPost.mapper.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 monthlyMagazine.mapper.ts
│   │   │   │   ├── 📄 notification.mapper.ts
│   │   │   │   ├── 📄 participation.mapper.ts
│   │   │   │   ├── 📄 user.mapper.ts
│   │   │   │   ├── 📄 volunteerProfile.mapper.ts
│   │   │   │   └── 📄 volunteerSpotlight.mapper.ts
│   │   │   └── 📁 useCases
│   │   │       ├── 📄 ActivityParticipationUseCase.ts
│   │   │       ├── 📄 ActivityUseCase.ts
│   │   │       ├── 📄 AuthUseCase.ts
│   │   │       ├── 📄 CertificateUseCase.ts
│   │   │       ├── 📄 EmailUseCase.ts
│   │   │       ├── 📄 FeaturedPostUseCase.ts
│   │   │       ├── 📄 MonthlyMagazineUseCase.ts
│   │   │       ├── 📄 NotificationUseCase.ts
│   │   │       ├── 📄 OtpUseCase.ts
│   │   │       ├── 📄 UserUseCase.ts
│   │   │       ├── 📄 VolunteerProfileUseCase.ts
│   │   │       ├── 📄 VolunteerSpotlightUseCase.ts
│   │   │       └── 📄 index.ts
│   │   └── 📁 domain
│   │       ├── 📁 entities
│   │       │   ├── 📄 Activity.ts
│   │       │   ├── 📄 ActivityParticipation.ts
│   │       │   ├── 📄 BaseEntity.ts
│   │       │   ├── 📄 Certificate.ts
│   │       │   ├── 📄 FeaturedPost.ts
│   │       │   ├── 📄 MonthlyMagazine.ts
│   │       │   ├── 📄 Notification.ts
│   │       │   ├── 📄 User.ts
│   │       │   ├── 📄 VolunteerProfile.ts
│   │       │   ├── 📄 VolunteerSpotlight.ts
│   │       │   └── 📄 index.ts
│   │       ├── 📁 enums
│   │       │   ├── 📄 ActivityStatus.ts
│   │       │   ├── 📄 ActivityType.ts
│   │       │   ├── 📄 AdminPermission.ts
│   │       │   ├── 📄 AttendanceStatus.ts
│   │       │   ├── 📄 CertificateStatus.ts
│   │       │   ├── 📄 DayOfWeek.ts
│   │       │   ├── 📄 DomainFeaturedPostCategory.ts
│   │       │   ├── 📄 Gender.ts
│   │       │   ├── 📄 JordanianCity.ts
│   │       │   ├── 📄 MeetingPlatform.ts
│   │       │   ├── 📄 NotificationType.ts
│   │       │   ├── 📄 ParticipationStatus.ts
│   │       │   ├── 📄 UserRole.ts
│   │       │   └── 📄 index.ts
│   │       ├── 📁 interfaces
│   │       │   ├── 📄 ActivityParticipationProps.ts
│   │       │   ├── 📄 ActivityProps.ts
│   │       │   ├── 📄 BaseEntityProps.ts
│   │       │   ├── 📄 CertificateProps.ts
│   │       │   ├── 📄 FeaturedPostProps.ts
│   │       │   ├── 📄 MonthlyMagazineProps.ts
│   │       │   ├── 📄 NotificationProps.ts
│   │       │   ├── 📄 UserProps.ts
│   │       │   ├── 📄 VolunteerSpotLightProps.ts
│   │       │   ├── 📄 VolunterProfileProps.ts
│   │       │   └── 📄 index.ts
│   │       └── 📁 valueObjects
│   │           ├── 📄 Email.ts
│   │           ├── 📄 Location.ts
│   │           ├── 📄 Time.ts
│   │           └── 📄 index.ts
│   ├── 📁 infrastructure
│   │   ├── 📁 auth
│   │   │   ├── 📄 config.ts
│   │   │   └── 📄 next-auth.d.ts
│   │   ├── 📁 external
│   │   │   ├── 📁 certificate
│   │   │   │   ├── 📄 CertificateGeneratorService.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 cloudFlare
│   │   │   │   ├── 📄 R2Client.ts
│   │   │   │   ├── 📄 R2StorageService.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 resend
│   │   │   │   ├── 📄 ResendClient.ts
│   │   │   │   └── 📄 index.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 persistence
│   │   │   ├── 📁 prisma
│   │   │   │   ├── 📄 client.ts
│   │   │   │   └── 📄 index.ts
│   │   │   └── 📁 repositories
│   │   │       ├── 📁 ActivityParticipationRepository
│   │   │       │   ├── 📄 ActivityParticipationRepository.ts
│   │   │       │   └── 📄 IActivityParticipationRepository.ts
│   │   │       ├── 📁 ActivityRepository
│   │   │       │   ├── 📄 ActivityRepository.ts
│   │   │       │   └── 📄 IActivityRepository.ts
│   │   │       ├── 📁 CertificateRepository
│   │   │       │   ├── 📄 CertificateRepository.ts
│   │   │       │   └── 📄 ICertificateRepository.ts
│   │   │       ├── 📁 FeaturedPostRepository
│   │   │       │   ├── 📄 FeaturedPostRepository.ts
│   │   │       │   └── 📄 IFeaturedPostRepository.ts
│   │   │       ├── 📁 MonthlyMagazineRepository
│   │   │       │   ├── 📄 IMonthlyMagazineRepository.ts
│   │   │       │   └── 📄 MonthlyMagazineRepository.ts
│   │   │       ├── 📁 NotificationRepository
│   │   │       │   ├── 📄 INotificationRepository.ts
│   │   │       │   └── 📄 NotificationRepository.ts
│   │   │       ├── 📁 OtpRepository
│   │   │       │   ├── 📄 IOtpRepository.ts
│   │   │       │   └── 📄 OtpRepository.ts
│   │   │       ├── 📁 PendingRegistrationRepository
│   │   │       │   ├── 📄 IPendingRegistrationRepository.ts
│   │   │       │   └── 📄 PendingRegistrationRepository.ts
│   │   │       ├── 📁 UserRepository
│   │   │       │   ├── 📄 IUserRespository.ts
│   │   │       │   └── 📄 UserRepository.ts
│   │   │       ├── 📁 VolunteerProfileRepository
│   │   │       │   ├── 📄 IVolunteerProfileRepository.ts
│   │   │       │   └── 📄 VolunteerProfileRepository.ts
│   │   │       ├── 📁 VolunteerSpotlightRepository
│   │   │       │   ├── 📄 IVolunteerSpotlightRepository.ts
│   │   │       │   └── 📄 VolunteerSpotlightRepository.ts
│   │   │       └── 📄 index.ts
│   │   └── 📁 security
│   │       ├── 📄 index.ts
│   │       └── 📄 sanitizer.ts
│   ├── 📁 lib
│   │   ├── 📁 config
│   │   │   ├── 📄 api-endpoints.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 inngest
│   │   │   ├── 📁 functions
│   │   │   │   ├── 📄 activityReminders.ts
│   │   │   │   └── 📄 issueCertificates.ts
│   │   │   ├── 📄 client.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 templates
│   │   │   ├── 📁 certificates
│   │   │   │   ├── 📄 CertificateHtmlTemplate.tsx
│   │   │   │   └── 📄 certificateImageBase64.ts
│   │   │   ├── 📁 emails
│   │   │   │   ├── 📄 bulkEmail.ts
│   │   │   │   ├── 📄 certificateEmail.ts
│   │   │   │   ├── 📄 contactEmail.ts
│   │   │   │   ├── 📄 emailFooter.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 otpEmail.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 certificate.ts
│   │   │   ├── 📄 date.ts
│   │   │   ├── 📄 image.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 logger.ts
│   │   │   ├── 📄 notificationUtils.ts
│   │   │   ├── 📄 pdf.ts
│   │   │   └── 📄 text.ts
│   │   ├── 📄 api-utils.ts
│   │   ├── 📄 providers.ts
│   │   └── 📄 webpush.ts
│   ├── 📁 presentation
│   │   ├── 📁 components
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 ActivityItem
│   │   │   │   │   ├── 🎨 ActivityItem.module.scss
│   │   │   │   │   └── 📄 ActivityItem.tsx
│   │   │   │   ├── 📁 ActivityModal
│   │   │   │   │   ├── 📄 ActivityModal.logic.ts
│   │   │   │   │   ├── 🎨 ActivityModal.module.scss
│   │   │   │   │   └── 📄 ActivityModal.tsx
│   │   │   │   ├── 📁 AdminActivityCard
│   │   │   │   │   ├── 🎨 AdminActivityCard.module.scss
│   │   │   │   │   └── 📄 AdminActivityCard.tsx
│   │   │   │   ├── 📁 AdminFeaturedPostCard
│   │   │   │   │   ├── 🎨 AdminFeaturedPostCard.module.scss
│   │   │   │   │   └── 📄 AdminFeaturedPostCard.tsx
│   │   │   │   ├── 📁 AdminMagazineCard
│   │   │   │   │   ├── 🎨 AdminMagazineCard.module.scss
│   │   │   │   │   └── 📄 AdminMagazineCard.tsx
│   │   │   │   ├── 📁 AdminSidebar
│   │   │   │   │   ├── 🎨 AdminSidebar.module.scss
│   │   │   │   │   └── 📄 AdminSidebar.tsx
│   │   │   │   ├── 📁 AdminTopbar
│   │   │   │   │   ├── 🎨 AdminTopbar.module.scss
│   │   │   │   │   └── 📄 AdminTopbar.tsx
│   │   │   │   ├── 📁 AdminVolunteerSpotlightCard
│   │   │   │   │   ├── 🎨 AdminVolunteerSpotlightCard.module.scss
│   │   │   │   │   └── 📄 AdminVolunteerSpotlightCard.tsx
│   │   │   │   ├── 📁 BroadcastRecipientsModal
│   │   │   │   │   ├── 🎨 BroadcastRecipientsModal.module.scss
│   │   │   │   │   └── 📄 BroadcastRecipientsModal.tsx
│   │   │   │   ├── 📁 CompleteActivityProgress
│   │   │   │   │   ├── 🎨 CompleteActivityProgress.module.scss
│   │   │   │   │   └── 📄 CompleteActivityProgress.tsx
│   │   │   │   ├── 📁 EditableField
│   │   │   │   │   ├── 📄 EditableField.logic.ts
│   │   │   │   │   ├── 🎨 EditableField.module.scss
│   │   │   │   │   └── 📄 EditableField.tsx
│   │   │   │   ├── 📁 EmailPreviewPane
│   │   │   │   │   ├── 🎨 EmailPreviewPane.module.scss
│   │   │   │   │   └── 📄 EmailPreviewPane.tsx
│   │   │   │   ├── 📁 ExportUsersButton
│   │   │   │   │   ├── 📄 ExportUsersButton.logic.ts
│   │   │   │   │   ├── 🎨 ExportUsersButton.module.scss
│   │   │   │   │   └── 📄 ExportUsersButton.tsx
│   │   │   │   ├── 📁 InfoCard
│   │   │   │   │   ├── 📄 InfoCard.logic.ts
│   │   │   │   │   ├── 🎨 InfoCard.module.scss
│   │   │   │   │   └── 📄 InfoCard.tsx
│   │   │   │   ├── 📁 NotificationPreviewModal
│   │   │   │   │   ├── 🎨 NotificationPreviewModal.module.scss
│   │   │   │   │   └── 📄 NotificationPreviewModal.tsx
│   │   │   │   ├── 📁 ParticipationRequestItem
│   │   │   │   │   ├── 🎨 ParticipationRequestItem.module.scss
│   │   │   │   │   └── 📄 ParticipationRequestItem.tsx
│   │   │   │   ├── 📁 PermissionsPanel
│   │   │   │   │   ├── 📄 PermissionsPanel.logic.ts
│   │   │   │   │   ├── 🎨 PermissionsPanel.module.scss
│   │   │   │   │   └── 📄 PermissionsPanel.tsx
│   │   │   │   ├── 📁 ProfileHeader
│   │   │   │   │   ├── 📄 ProfileHeader.logic.ts
│   │   │   │   │   ├── 🎨 ProfileHeader.module.scss
│   │   │   │   │   └── 📄 ProfileHeader.tsx
│   │   │   │   ├── 📁 StatsCard
│   │   │   │   │   ├── 🎨 StatsCard.module.scss
│   │   │   │   │   ├── 📄 StatsCard.tsx
│   │   │   │   │   └── 📄 StatsCardlogic.ts
│   │   │   │   ├── 📁 UserCard
│   │   │   │   │   ├── 🎨 UserCard.module.scss
│   │   │   │   │   └── 📄 UserCard.tsx
│   │   │   │   ├── 📁 UserStatsCard
│   │   │   │   │   ├── 🎨 UserStatsCard.module.scss
│   │   │   │   │   └── 📄 UserStatsCard.tsx
│   │   │   │   └── 📁 VolunteersModal
│   │   │   │       ├── 📄 VolunteersModal.logic.ts
│   │   │   │       ├── 🎨 VolunteersModal.module.scss
│   │   │   │       └── 📄 VolunteersModal.tsx
│   │   │   ├── 📁 base
│   │   │   │   ├── 📁 AnimatedBackground
│   │   │   │   │   ├── 🎨 AnimatedBackground.module.scss
│   │   │   │   │   └── 📄 AnimatedBackground.tsx
│   │   │   │   ├── 📁 Avatar
│   │   │   │   │   ├── 🎨 Avatar.module.scss
│   │   │   │   │   └── 📄 Avatar.tsx
│   │   │   │   ├── 📁 Badge
│   │   │   │   │   ├── 📄 Badge.logic.ts
│   │   │   │   │   ├── 🎨 Badge.module.scss
│   │   │   │   │   └── 📄 Badge.tsx
│   │   │   │   ├── 📁 BirthDateInput
│   │   │   │   │   ├── 🎨 BirthDateInput.module.scss
│   │   │   │   │   └── 📄 BirthDateInput.tsx
│   │   │   │   ├── 📁 Button
│   │   │   │   │   ├── 🎨 Button.module.scss
│   │   │   │   │   └── 📄 Button.tsx
│   │   │   │   ├── 📁 ConfirmDialog
│   │   │   │   │   ├── 📄 ConfirmDialog.logic.ts
│   │   │   │   │   ├── 🎨 ConfirmDialog.module.scss
│   │   │   │   │   └── 📄 ConfirmDialog.tsx
│   │   │   │   ├── 📁 Container
│   │   │   │   │   ├── 🎨 Container.module.scss
│   │   │   │   │   └── 📄 Container.tsx
│   │   │   │   ├── 📁 DateInput
│   │   │   │   │   ├── 🎨 DateInput.module.scss
│   │   │   │   │   └── 📄 DateInput.tsx
│   │   │   │   ├── 📁 Dropdown
│   │   │   │   │   ├── 🎨 Dropdown.module.scss
│   │   │   │   │   └── 📄 Dropdown.tsx
│   │   │   │   ├── 📁 Footer
│   │   │   │   │   ├── 🎨 Footer.module.scss
│   │   │   │   │   └── 📄 Footer.tsx
│   │   │   │   ├── 📁 Header
│   │   │   │   │   ├── 🎨 Header.module.scss
│   │   │   │   │   └── 📄 Header.tsx
│   │   │   │   ├── 📁 Input
│   │   │   │   │   ├── 🎨 Input.module.scss
│   │   │   │   │   └── 📄 Input.tsx
│   │   │   │   ├── 📁 LocationPicker
│   │   │   │   │   ├── 📄 LocationPicker.logic.ts
│   │   │   │   │   ├── 🎨 LocationPicker.module.scss
│   │   │   │   │   └── 📄 LocationPicker.tsx
│   │   │   │   ├── 📁 MultiSelectInput
│   │   │   │   │   ├── 📄 MultiSelectInput.logic.ts
│   │   │   │   │   ├── 🎨 MultiSelectInput.module.scss
│   │   │   │   │   └── 📄 MultiSelectInput.tsx
│   │   │   │   ├── 📁 OtpCircularTimer
│   │   │   │   │   ├── 🎨 OtpCircularTimer.module.scss
│   │   │   │   │   └── 📄 OtpCircularTimer.tsx
│   │   │   │   ├── 📁 OtpInput
│   │   │   │   │   ├── 🎨 OtpInput.module.scss
│   │   │   │   │   └── 📄 OtpInput.tsx
│   │   │   │   ├── 📁 OtpSuccessOverlay
│   │   │   │   │   ├── 🎨 OtpSuccessOverlay.module.scss
│   │   │   │   │   └── 📄 OtpSuccessOverlay.tsx
│   │   │   │   ├── 📁 Pagination
│   │   │   │   │   ├── 📄 Pagination.logic.ts
│   │   │   │   │   ├── 🎨 Pagination.module.scss
│   │   │   │   │   └── 📄 Pagination.tsx
│   │   │   │   ├── 📁 PasswordField
│   │   │   │   │   ├── 🎨 PasswordField.module.scss
│   │   │   │   │   └── 📄 PasswordField.tsx
│   │   │   │   ├── 📁 PasswordStrength
│   │   │   │   │   ├── 🎨 PasswordStrength.module.scss
│   │   │   │   │   └── 📄 PasswordStrength.tsx
│   │   │   │   ├── 📁 Search
│   │   │   │   │   ├── 📄 Search.logic.ts
│   │   │   │   │   ├── 🎨 Search.module.scss
│   │   │   │   │   └── 📄 Search.tsx
│   │   │   │   ├── 📁 SectionHeader
│   │   │   │   │   ├── 🎨 SectionHeader.module.scss
│   │   │   │   │   └── 📄 SectionHeader.tsx
│   │   │   │   ├── 📁 SelectInput
│   │   │   │   │   ├── 🎨 SelectInput.module.scss
│   │   │   │   │   └── 📄 SelectInput.tsx
│   │   │   │   ├── 📁 Share
│   │   │   │   │   ├── 📄 Share.logic.ts
│   │   │   │   │   ├── 🎨 Share.module.scss
│   │   │   │   │   └── 📄 Share.tsx
│   │   │   │   ├── 📁 StatusBubble
│   │   │   │   │   ├── 🎨 StatusBubble.module.scss
│   │   │   │   │   └── 📄 StatusBubble.tsx
│   │   │   │   └── 📁 TimePickerInput
│   │   │   │       ├── 🎨 TimePickerInput.module.scss
│   │   │   │       └── 📄 TimePickerInput.tsx
│   │   │   ├── 📁 home
│   │   │   │   ├── 📁 AboutSection
│   │   │   │   │   ├── 🎨 AboutSection.module.scss
│   │   │   │   │   └── 📄 AboutSection.tsx
│   │   │   │   ├── 📁 ActivityCard
│   │   │   │   │   ├── 🎨 ActivityCard.module.scss
│   │   │   │   │   └── 📄 ActivityCard.tsx
│   │   │   │   ├── 📁 ActivityCarousel
│   │   │   │   │   ├── 🎨 ActivityCarousel.module.scss
│   │   │   │   │   ├── 📄 ActivityCarousel.tsx
│   │   │   │   │   └── 📄 useActivityCarousel.ts
│   │   │   │   ├── 📁 ContactSection
│   │   │   │   │   ├── 📄 ContactSection.logic.ts
│   │   │   │   │   ├── 🎨 ContactSection.module.scss
│   │   │   │   │   └── 📄 ContactSection.tsx
│   │   │   │   ├── 📁 FeaturedPostCard
│   │   │   │   │   ├── 🎨 FeaturedPostCard.module.scss
│   │   │   │   │   └── 📄 FeaturedPostCard.tsx
│   │   │   │   ├── 📁 HeroSection
│   │   │   │   │   ├── 🎨 HeroSection.module.scss
│   │   │   │   │   └── 📄 HeroSection.tsx
│   │   │   │   ├── 📁 MagazineCard
│   │   │   │   │   ├── 🎨 MagazineCard.module.scss
│   │   │   │   │   └── 📄 MagazineCard.tsx
│   │   │   │   └── 📁 VolunteerSpotlightCard
│   │   │   │       ├── 🎨 VolunteerSpotlightCard.module.scss
│   │   │   │       └── 📄 VolunteerSpotlightCard.tsx
│   │   │   ├── 📁 state
│   │   │   │   ├── 📁 EmptyState
│   │   │   │   │   ├── 🎨 EmptyState.module.scss
│   │   │   │   │   └── 📄 EmptyState.tsx
│   │   │   │   ├── 📁 ErrorState
│   │   │   │   ├── 📁 LoadingState
│   │   │   │   │   ├── 📄 LoadingState.logic.ts
│   │   │   │   │   ├── 🎨 LoadingState.module.scss
│   │   │   │   │   └── 📄 LoadingState.tsx
│   │   │   │   ├── 📁 Modal
│   │   │   │   │   ├── 📄 Modal.logic.ts
│   │   │   │   │   ├── 🎨 Modal.module.scss
│   │   │   │   │   └── 📄 Modal.tsx
│   │   │   │   └── 📁 Toast
│   │   │   │       ├── 📄 Toast.logic.ts
│   │   │   │       ├── 🎨 Toast.module.scss
│   │   │   │       └── 📄 Toast.tsx
│   │   │   ├── 📁 volunteer
│   │   │   │   ├── 📁 CertificateCard
│   │   │   │   │   ├── 📄 CertificateCard.logic.ts
│   │   │   │   │   ├── 🎨 CertificateCard.module.scss
│   │   │   │   │   └── 📄 CertificateCard.tsx
│   │   │   │   ├── 📁 Chatbot
│   │   │   │   │   ├── 📄 AiBotIcon.tsx
│   │   │   │   │   ├── 🎨 Chatbot.module.scss
│   │   │   │   │   ├── 📄 Chatbot.tsx
│   │   │   │   │   └── 📄 ChatbotWrapper.tsx
│   │   │   │   ├── 📁 NotificationBell
│   │   │   │   │   ├── 🎨 NotificationBell.module.scss
│   │   │   │   │   └── 📄 NotificationBell.tsx
│   │   │   │   ├── 📁 NotificationDropdown
│   │   │   │   │   ├── 🎨 NotificationDropdown.module.scss
│   │   │   │   │   └── 📄 NotificationDropdown.tsx
│   │   │   │   ├── 📁 PushBanner
│   │   │   │   │   ├── 🎨 PushBanner.module.scss
│   │   │   │   │   ├── 📄 PushBanner.tsx
│   │   │   │   │   └── 📄 PushBannerWrapper.tsx
│   │   │   │   └── 📁 UserMenuDropdown
│   │   │   │       ├── 🎨 UserMenuDropdown.module.scss
│   │   │   │       └── 📄 UserMenuDropdown.tsx.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 constants
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 labels.ts
│   │   │   ├── 📄 permissions.ts
│   │   │   └── 📄 routes.ts
│   │   ├── 📁 context
│   │   │   ├── 📄 NotificationsContext.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 hooks
│   │   │   ├── 📁 apiHooks
│   │   │   │   ├── 📄 useActivities.ts
│   │   │   │   ├── 📄 useActivityParticipations.ts
│   │   │   │   ├── 📄 useAuth.ts
│   │   │   │   ├── 📄 useCertificates.ts
│   │   │   │   ├── 📄 useCompleteActivity.ts
│   │   │   │   ├── 📄 useFeaturedPosts.ts
│   │   │   │   ├── 📄 useMonthlyMagazine.ts
│   │   │   │   ├── 📄 useNotifications.ts
│   │   │   │   ├── 📄 usePushNotifications.ts
│   │   │   │   ├── 📄 useUserDetails.ts
│   │   │   │   ├── 📄 useUsers.ts
│   │   │   │   └── 📄 useVolunteerSpotlight.ts
│   │   │   ├── 📁 uiHooks
│   │   │   │   ├── 📄 useOtpTimer.ts
│   │   │   │   ├── 📄 usePasswordValidation.ts
│   │   │   │   └── 📄 useToast.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 pages
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 ActivitiesPage
│   │   │   │   │   ├── 📄 ActivitiesPage.logic.ts
│   │   │   │   │   ├── 🎨 ActivitiesPage.module.scss
│   │   │   │   │   └── 📄 ActivitiesPage.tsx
│   │   │   │   ├── 📁 AdminUserDetailsPage
│   │   │   │   │   ├── 📄 AdminUserDetailsPage.logic.ts
│   │   │   │   │   ├── 🎨 AdminUserDetailsPage.module.scss
│   │   │   │   │   └── 📄 AdminUserDetailsPage.tsx
│   │   │   │   ├── 📁 EmailsPage
│   │   │   │   │   ├── 📄 EmailsPage.logic.ts
│   │   │   │   │   ├── 🎨 EmailsPage.module.scss
│   │   │   │   │   └── 📄 EmailsPage.tsx
│   │   │   │   ├── 📁 FeaturedPostsPage
│   │   │   │   │   ├── 📄 FeaturedPostsPage.logic.ts
│   │   │   │   │   ├── 🎨 FeaturedPostsPage.module.scss
│   │   │   │   │   └── 📄 FeaturedPostsPage.tsx
│   │   │   │   ├── 📁 MagazinesPage
│   │   │   │   │   ├── 📄 MagazinesPage.logic.ts
│   │   │   │   │   ├── 🎨 MagazinesPage.module.scss
│   │   │   │   │   └── 📄 MagazinesPage.tsx
│   │   │   │   ├── 📁 NotificationsPage
│   │   │   │   │   ├── 📄 NotificationsPage.logic.ts
│   │   │   │   │   ├── 🎨 NotificationsPage.module.scss
│   │   │   │   │   └── 📄 NotificationsPage.tsx
│   │   │   │   ├── 📁 ParticipationRequestsPage
│   │   │   │   │   ├── 📄 ParticipationRequestsPage.logic.ts
│   │   │   │   │   ├── 🎨 ParticipationRequestsPage.module.scss
│   │   │   │   │   └── 📄 ParticipationRequestsPage.tsx
│   │   │   │   ├── 📁 PermissionsPage
│   │   │   │   │   ├── 📄 PermissionsPage.logic.ts
│   │   │   │   │   ├── 🎨 PermissionsPage.module.scss
│   │   │   │   │   └── 📄 PermissionsPage.tsx
│   │   │   │   ├── 📁 UserManagementPage
│   │   │   │   │   ├── 📄 UserManagementPage.logic.ts
│   │   │   │   │   ├── 🎨 UserManagementPage.module.scss
│   │   │   │   │   └── 📄 UserManagementPage.tsx
│   │   │   │   └── 📁 VolunteerSpotlightPage
│   │   │   │       ├── 📄 VolunteerSpotlightPage.logic.ts
│   │   │   │       ├── 🎨 VolunteerSpotlightPage.module.scss
│   │   │   │       └── 📄 VolunteerSpotlightPage.tsx
│   │   │   ├── 📁 home
│   │   │   │   ├── 📁 AboutPage
│   │   │   │   │   ├── 🎨 AboutPage.module.scss
│   │   │   │   │   └── 📄 AboutPage.tsx
│   │   │   │   ├── 📁 ActivitiesPublicPage
│   │   │   │   │   ├── 📄 ActivitiesPublicPage.logic.ts
│   │   │   │   │   ├── 🎨 ActivitiesPublicPage.module.scss
│   │   │   │   │   └── 📄 ActivitiesPublicPage.tsx
│   │   │   │   ├── 📁 ActivityDetailsPage
│   │   │   │   │   ├── 🎨 ActivityDetailsPage.module.scss
│   │   │   │   │   └── 📄 ActivityDetailsPage.tsx
│   │   │   │   ├── 📁 ConatctPage
│   │   │   │   │   ├── 🎨 ContactPage.module.scss
│   │   │   │   │   └── 📄 ContactPage.tsx
│   │   │   │   ├── 📁 FeaturedPostsPublicPage
│   │   │   │   │   ├── 📄 FeaturedPostsPublicPage.logic.ts
│   │   │   │   │   ├── 🎨 FeaturedPostsPublicPage.module.scss
│   │   │   │   │   └── 📄 FeaturedPostsPublicPage.tsx
│   │   │   │   ├── 📁 IntroPage
│   │   │   │   │   ├── 🎨 IntroPage.module.scss
│   │   │   │   │   ├── 📄 IntroPage.tsx
│   │   │   │   │   └── 📄 IntroWrapper.tsx
│   │   │   │   ├── 📁 MagazinesPublicPage
│   │   │   │   │   ├── 📄 MagazinesPublicPage.logic.ts
│   │   │   │   │   ├── 🎨 MagazinesPublicPage.module.scss
│   │   │   │   │   └── 📄 MagazinesPublicPage.tsx
│   │   │   │   ├── 📁 MainPage
│   │   │   │   │   ├── 📄 MainPage.logic.ts
│   │   │   │   │   ├── 🎨 MainPage.module.scss
│   │   │   │   │   └── 📄 MainPage.tsx
│   │   │   │   ├── 📁 PostDetailsPage
│   │   │   │   │   ├── 🎨 PostDetailsPage.module.scss
│   │   │   │   │   └── 📄 PostDetailsPage.tsx
│   │   │   │   ├── 📁 VerifyPage
│   │   │   │   │   ├── 🎨 VerifyPage.module.scss
│   │   │   │   │   └── 📄 VerifyPage.tsx
│   │   │   │   ├── 📁 VolunteerSpotlightDetailsPage
│   │   │   │   │   ├── 🎨 VolunteerSpotlightDetailsPage.module.scss
│   │   │   │   │   └── 📄 VolunteerSpotlightDetailsPage.tsx
│   │   │   │   └── 📁 VolunteerSpotlightPublicPage
│   │   │   │       ├── 📄 VolunteerSpotlightPublicPage.logic.ts
│   │   │   │       ├── 🎨 VolunteerSpotlightPublicPage.module.scss
│   │   │   │       └── 📄 VolunteerSpotlightPublicPage.tsx
│   │   │   ├── 📁 volunteer
│   │   │   │   ├── 📁 VolunteerActivitiesPage
│   │   │   │   │   ├── 📄 VolunteerActivitiesPage.logic.ts
│   │   │   │   │   ├── 🎨 VolunteerActivitiesPage.module.scss
│   │   │   │   │   └── 📄 VolunteerActivitiesPage.tsx
│   │   │   │   ├── 📁 VolunteerCertificatesPage
│   │   │   │   │   ├── 📄 VolunteerCertificatesPage.logic.ts
│   │   │   │   │   ├── 🎨 VolunteerCertificatesPage.module.scss
│   │   │   │   │   └── 📄 VolunteerCertificatesPage.tsx
│   │   │   │   └── 📁 VolunteerProfilePage
│   │   │   │       ├── 📄 VolunteerProfilePage.logic.ts
│   │   │   │       ├── 🎨 VolunteerProfilePage.module.scss
│   │   │   │       └── 📄 VolunteerProfilePage.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 services
│   │   │   ├── 📄 activities.service.ts
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 certificate.service.ts
│   │   │   ├── 📄 client.service.ts
│   │   │   ├── 📄 email.service.ts
│   │   │   ├── 📄 featuredPost.service.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 monthlyMagazine.service.ts
│   │   │   ├── 📄 notification.service.ts
│   │   │   ├── 📄 participation.service.ts
│   │   │   ├── 📄 upload.service.ts
│   │   │   ├── 📄 user.service.ts
│   │   │   ├── 📄 volunteerProfile.service.ts
│   │   │   └── 📄 volunteerSpotlight.service.ts
│   │   └── 📁 styles
│   │       ├── 🎨 _admin-mixins.scss
│   │       ├── 🎨 _effects.scss
│   │       ├── 🎨 _mixins.scss
│   │       ├── 🎨 _variables.scss
│   │       └── 🎨 globals.scss
│   ├── 📄 instrumentation-client.ts
│   ├── 📄 instrumentation.ts
│   └── 📄 proxy.ts
├── ⚙️ .gitignore
├── ⚙️ .hintrc
├── ⚙️ .prettierrc
├── ⚙️ docker-compose.yml
├── 📄 next-sitemap.config.js
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 sentry.edge.config.ts
├── 📄 sentry.server.config.ts
├── 📕 test-output.pdf
├── 🖼️ test-output.png
└── ⚙️ tsconfig.json
```

---
*Generated by FileTree Pro Extension*