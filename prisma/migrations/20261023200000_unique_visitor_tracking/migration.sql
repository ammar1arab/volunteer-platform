CREATE TABLE "analytics_visitors" (
    "key" TEXT NOT NULL,
    "volunteerKey" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_visitors_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "analytics_visitors_volunteerKey_idx" ON "analytics_visitors"("volunteerKey");

CREATE TABLE "analytics_visitor_days" (
    "visitorKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "browser" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    CONSTRAINT "analytics_visitor_days_pkey" PRIMARY KEY ("visitorKey", "day"),
    CONSTRAINT "analytics_visitor_days_visitorKey_fkey" FOREIGN KEY ("visitorKey")
      REFERENCES "analytics_visitors"("key") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "analytics_visitor_days_day_idx" ON "analytics_visitor_days"("day");
