-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PENDING_INTAKE', 'INTAKE_FORM_COMPLETE', 'SETUP_LINK_SENT', 'FEE_PAID', 'WORK_COMPLETED', 'DEMO_APPROVED', 'JOB_COMPLETED');

-- CreateEnum
CREATE TYPE "ClientActivityType" AS ENUM ('CLIENT_CREATED', 'INTAKE_LINK_SENT', 'INTAKE_FORM_STARTED', 'INTAKE_FORM_COMPLETED', 'CLIENT_INFO_UPDATED', 'MEETING_BOOKED', 'SETUP_LINK_SENT', 'SETUP_FEE_PAID', 'SUBSCRIPTION_STARTED', 'SUBSCRIPTION_UPDATED', 'PAYMENT_FAILED', 'SUBSCRIPTION_CANCELED', 'WORK_STARTED', 'WORK_COMPLETED', 'DEMO_SENT', 'DEMO_APPROVED', 'JOB_COMPLETED', 'SUBDOMAIN_PROVISIONED', 'INTEGRATION_CONNECTED', 'EMAIL_SENT', 'SMS_SENT', 'GENERATED_IMAGE', 'SHARED_PROJECT', 'UPSCALED_IMAGE', 'FOLLOWUP_IMAGE_SENT', 'INBOUND_CALL', 'OUTBOUND_CALL', 'INBOUND_EMAIL', 'VOICE_OUTBOUND', 'VOICE_INBOUND', 'SMS_INBOUND', 'QUOTE_GENERATION', 'AI_PAUSED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "MediaAssetFileType" AS ENUM ('IMAGE', 'PDF');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'PROPERTY_MANAGER', 'DEMO', 'OTHER');

-- CreateEnum
CREATE TYPE "MetadataSource" AS ENUM ('IMAGEN', 'UPSCALE', 'VOICE', 'QUOTE_GENERATION', 'COMMUNICATION', 'NUDGE');

-- CreateEnum
CREATE TYPE "SystemTaskType" AS ENUM ('IMAGEN', 'UPSCALE', 'VIDEO', 'VOICE_MOCKUP', 'VOICE', 'STUDIO_IMAGEN', 'STUDIO_UPSCALE', 'QUOTE_GENERATION', 'COMMUNICATION', 'NUDGE', 'INTELLIGENCE', 'OUTBOUND_CALL');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('S3', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "SystemTaskRole" AS ENUM ('AI', 'CLIENT', 'USER', 'OPERATOR', 'SYSTEM', 'HUECLAW');

-- CreateEnum
CREATE TYPE "SystemTaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommunicationRole" AS ENUM ('AI', 'CLIENT', 'USER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('SMS', 'PHONE', 'MEETING', 'DEMO', 'EMAIL', 'IMAGEN', 'AI_SUGESSTION', 'QUOTE', 'NONE', 'VOICE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CLOSED', 'LOST', 'BOOKED', 'WON');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('QUICK', 'PROJECT', 'SELF_SERVE');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('OWNER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "CallReason" AS ENUM ('NEW_PROJECT', 'STATUS_UPDATE', 'COLOR_CHANGE', 'PRICING', 'FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CALL', 'MOCKUP', 'PAYMENT', 'STATUS_CHANGE', 'SMS', 'NOTE', 'SHARE', 'ROOM', 'UPSCALE', 'VIDEO', 'MEETING', 'QUOTE', 'EMAIL');

-- CreateEnum
CREATE TYPE "LogActor" AS ENUM ('AI', 'SYSTEM', 'PAINTER', 'CLIENT');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "SubdomainUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "imageUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "phone" TEXT,
    "subdomainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubdomainUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProject" (
    "id" TEXT NOT NULL,
    "name" TEXT DEFAULT 'Untitled Design',
    "originalImageS3Key" TEXT,
    "compressedImageS3Key" TEXT,
    "activeBrand" TEXT,
    "activeColorCode" TEXT,
    "activeColorHex" TEXT,
    "removeFurniture" BOOLEAN NOT NULL DEFAULT false,
    "subdomainId" TEXT NOT NULL,
    "creatorId" TEXT,
    "bookingId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'PENDING_INTAKE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "setupFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "planStatus" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "planPrice" TEXT,
    "planName" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "crm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSettings" (
    "id" TEXT NOT NULL,
    "subdomainId" TEXT,
    "meta" JSONB,
    "logo" TEXT,
    "logoWidth" INTEGER DEFAULT 130,
    "logoHeight" INTEGER DEFAULT 130,
    "splashScreen" TEXT,
    "theme" JSONB,
    "twilioPhoneNumber" TEXT,
    "forwardingNumber" TEXT,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormData" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "features" TEXT[],
    "config" JSONB,
    "hours" TEXT,
    "name" TEXT,
    "crm" TEXT,
    "subdomainId" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT,
    "isAutoPilot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientActivity" (
    "id" TEXT NOT NULL,
    "type" "ClientActivityType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "clientId" TEXT,
    "demoClientId" TEXT,
    "subDomainId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "chatThreadId" TEXT,

    CONSTRAINT "ClientActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subdomain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "companyName" TEXT,
    "projectUrl" TEXT,
    "logo" TEXT,
    "logoWidth" INTEGER DEFAULT 130,
    "logoHeight" INTEGER DEFAULT 130,
    "splashScreen" TEXT,
    "theme" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "intelligenceId" TEXT,
    "roomIntelligenceId" TEXT,
    "twilioPhoneNumber" TEXT,
    "forwardingNumber" TEXT,
    "activeFlowId" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Subdomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpSchedule" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "triggerAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "scheduleName" TEXT,
    "chatThreadId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branding" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "logoWidth" INTEGER DEFAULT 130,
    "logoHeight" INTEGER DEFAULT 130,
    "splashScreen" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subdomainId" TEXT NOT NULL,

    CONSTRAINT "Branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomIntelligence" (
    "id" TEXT NOT NULL,
    "prompt" TEXT,
    "intelligence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intelligence" (
    "id" TEXT NOT NULL,
    "prompt" TEXT,
    "values" JSONB,
    "schema" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallFlow" (
    "id" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "nodes" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubBookingData" (
    "id" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "huelineId" TEXT NOT NULL,
    "status" "BookingStatus" DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "originalImages" TEXT NOT NULL,
    "compressOriginalImages" TEXT,
    "summary" TEXT NOT NULL,
    "dimensions" TEXT,
    "dateTime" TIMESTAMP(3),
    "pin" TEXT NOT NULL,
    "guestPins" TEXT[],
    "expiresAt" INTEGER,
    "initialIntent" "CallReason" NOT NULL DEFAULT 'NEW_PROJECT',
    "lastCallReason" "CallReason",
    "lastCallAt" TIMESTAMP(3),
    "lastCallAudioUrl" TEXT,
    "lastVideoUrl" TEXT,
    "lastVideoAt" TEXT,
    "lastInteraction" TEXT,
    "selfServeCompletion" BOOLEAN DEFAULT false,
    "projectType" TEXT,
    "projectScope" TEXT[],
    "estimatedValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "relatedThreadId" TEXT,

    CONSTRAINT "SubBookingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "bookingId" TEXT,
    "subdomainId" TEXT NOT NULL,
    "huelineId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "items" JSON,
    "totalAmount" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoClient" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "initialFollowUp" BOOLEAN DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "subdomainId" TEXT,
    "subBookingDataId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DemoClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "initialFollowUp" BOOLEAN DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "subdomainId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "customerType" "CustomerType" NOT NULL DEFAULT 'RESIDENTIAL',

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "MediaAssetFileType" NOT NULL,
    "s3Key" TEXT,
    "compressedKey" TEXT,
    "metadata" JSONB,
    "customerId" TEXT,
    "threadId" TEXT,
    "subdomainId" TEXT NOT NULL,
    "bookingId" TEXT,
    "projectId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCommunication" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "subject" TEXT,
    "role" "CommunicationRole" NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "demoClientId" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "operatorId" TEXT,
    "customerId" TEXT,
    "chatThreadId" TEXT,

    CONSTRAINT "ClientCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemTask" (
    "id" TEXT NOT NULL,
    "status" "SystemTaskStatus" NOT NULL,
    "type" "SystemTaskType" NOT NULL,
    "model" TEXT,
    "cost" DOUBLE PRECISION,
    "lockKey" TEXT NOT NULL,
    "initiator" "SystemTaskRole" NOT NULL,
    "operatorId" TEXT,
    "deliveryMethod" TEXT NOT NULL,
    "metadata" JSONB,
    "metadataSource" "MetadataSource",
    "demoClientId" TEXT,
    "subdomainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "SystemTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAttachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mediaSource" "MediaSource" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "compressedKey" TEXT,
    "zohoAttachmentId" TEXT,
    "clientCommunicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "creatorId" TEXT,
    "bookingId" TEXT,
    "domainId" TEXT NOT NULL,
    "scopeData" JSONB,
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "sessionType" "RoomType" DEFAULT 'QUICK',
    "agentDispatched" BOOLEAN DEFAULT false,
    "isProcessing" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT,
    "callerName" TEXT,
    "callerPhone" TEXT,
    "callDirection" "CallDirection" NOT NULL DEFAULT 'INBOUND',
    "callSid" TEXT NOT NULL,
    "recordingSid" TEXT,
    "audioUrl" TEXT,
    "duration" TEXT,
    "status" TEXT,
    "roomName" TEXT NOT NULL,
    "callType" TEXT,
    "transcript" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subdomainId" TEXT,
    "customerId" TEXT,
    "threadId" TEXT,
    "systemTaskId" TEXT,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallIntelligence" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "callReason" "CallReason" NOT NULL DEFAULT 'OTHER',
    "projectScope" TEXT,
    "callOutcome" "CallOutcome",
    "estimatedAdditionalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customFields" JSONB,
    "costBreakdown" TEXT,
    "transcriptText" TEXT,
    "callSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "systemTaskId" TEXT,
    "bookingId" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mockup" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "compressedS3Key" TEXT,
    "roomType" TEXT NOT NULL,
    "presignedUrl" TEXT,
    "colorBrand" TEXT,
    "colorCode" TEXT,
    "colorName" TEXT,
    "colorHex" TEXT,
    "brand" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "colorRal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "designProjectId" TEXT,

    CONSTRAINT "Mockup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaintColor" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "ral" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaintColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlternateColor" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT NOT NULL,
    "ral" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlternateColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedAccess" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT NOT NULL,
    "email" TEXT,
    "accessType" "AccessType" NOT NULL DEFAULT 'READ_ONLY',
    "pin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" TEXT NOT NULL,
    "bookingDataId" TEXT,
    "subdomainId" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "actor" "LogActor" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "systemTaskId" TEXT,
    "huelineId" TEXT,
    "messageId" TEXT,
    "customerId" TEXT,
    "subdomainId" TEXT,
    "threadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubdomainUser_email_key" ON "SubdomainUser"("email");

-- CreateIndex
CREATE INDEX "DesignProject_subdomainId_idx" ON "DesignProject"("subdomainId");

-- CreateIndex
CREATE INDEX "DesignProject_bookingId_idx" ON "DesignProject"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_stripeCustomerId_key" ON "Client"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "SubSettings_subdomainId_key" ON "SubSettings"("subdomainId");

-- CreateIndex
CREATE UNIQUE INDEX "FormData_email_key" ON "FormData"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FormData_subdomainId_key" ON "FormData"("subdomainId");

-- CreateIndex
CREATE UNIQUE INDEX "FormData_clientId_key" ON "FormData"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThread_shortId_key" ON "ChatThread"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Subdomain_slug_key" ON "Subdomain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subdomain_clientId_key" ON "Subdomain"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Branding_subdomainId_key" ON "Branding"("subdomainId");

-- CreateIndex
CREATE INDEX "CallFlow_subdomainId_idx" ON "CallFlow"("subdomainId");

-- CreateIndex
CREATE UNIQUE INDEX "SubBookingData_huelineId_key" ON "SubBookingData"("huelineId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoClient_subBookingDataId_key" ON "DemoClient"("subBookingDataId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomKey_key" ON "Room"("roomKey");

-- CreateIndex
CREATE UNIQUE INDEX "Call_roomName_key" ON "Call"("roomName");

-- CreateIndex
CREATE INDEX "Call_bookingDataId_idx" ON "Call"("bookingDataId");

-- CreateIndex
CREATE UNIQUE INDEX "CallIntelligence_callId_key" ON "CallIntelligence"("callId");

-- CreateIndex
CREATE INDEX "CallIntelligence_callReason_idx" ON "CallIntelligence"("callReason");

-- CreateIndex
CREATE INDEX "CallIntelligence_callOutcome_idx" ON "CallIntelligence"("callOutcome");

-- CreateIndex
CREATE INDEX "Export_bookingId_idx" ON "Export"("bookingId");

-- CreateIndex
CREATE INDEX "Mockup_bookingDataId_idx" ON "Mockup"("bookingDataId");

-- CreateIndex
CREATE INDEX "PaintColor_bookingDataId_idx" ON "PaintColor"("bookingDataId");

-- CreateIndex
CREATE INDEX "AlternateColor_bookingDataId_idx" ON "AlternateColor"("bookingDataId");

-- CreateIndex
CREATE INDEX "SharedAccess_bookingDataId_idx" ON "SharedAccess"("bookingDataId");

-- CreateIndex
CREATE INDEX "Logs_bookingDataId_idx" ON "Logs"("bookingDataId");

-- CreateIndex
CREATE INDEX "Logs_subdomainId_idx" ON "Logs"("subdomainId");

-- AddForeignKey
ALTER TABLE "SubdomainUser" ADD CONSTRAINT "SubdomainUser_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "SubdomainUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SubBookingData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSettings" ADD CONSTRAINT "SubSettings_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_demoClientId_fkey" FOREIGN KEY ("demoClientId") REFERENCES "DemoClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_subDomainId_fkey" FOREIGN KEY ("subDomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_chatThreadId_fkey" FOREIGN KEY ("chatThreadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subdomain" ADD CONSTRAINT "Subdomain_intelligenceId_fkey" FOREIGN KEY ("intelligenceId") REFERENCES "Intelligence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subdomain" ADD CONSTRAINT "Subdomain_roomIntelligenceId_fkey" FOREIGN KEY ("roomIntelligenceId") REFERENCES "RoomIntelligence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subdomain" ADD CONSTRAINT "Subdomain_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpSchedule" ADD CONSTRAINT "FollowUpSchedule_chatThreadId_fkey" FOREIGN KEY ("chatThreadId") REFERENCES "ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpSchedule" ADD CONSTRAINT "FollowUpSchedule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpSchedule" ADD CONSTRAINT "FollowUpSchedule_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branding" ADD CONSTRAINT "Branding_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallFlow" ADD CONSTRAINT "CallFlow_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubBookingData" ADD CONSTRAINT "SubBookingData_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubBookingData" ADD CONSTRAINT "SubBookingData_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubBookingData" ADD CONSTRAINT "SubBookingData_relatedThreadId_fkey" FOREIGN KEY ("relatedThreadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SubBookingData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoClient" ADD CONSTRAINT "DemoClient_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoClient" ADD CONSTRAINT "DemoClient_subBookingDataId_fkey" FOREIGN KEY ("subBookingDataId") REFERENCES "SubBookingData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SubBookingData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCommunication" ADD CONSTRAINT "ClientCommunication_demoClientId_fkey" FOREIGN KEY ("demoClientId") REFERENCES "DemoClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCommunication" ADD CONSTRAINT "ClientCommunication_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCommunication" ADD CONSTRAINT "ClientCommunication_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "SubdomainUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCommunication" ADD CONSTRAINT "ClientCommunication_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCommunication" ADD CONSTRAINT "ClientCommunication_chatThreadId_fkey" FOREIGN KEY ("chatThreadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemTask" ADD CONSTRAINT "SystemTask_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "SubdomainUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemTask" ADD CONSTRAINT "SystemTask_demoClientId_fkey" FOREIGN KEY ("demoClientId") REFERENCES "DemoClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemTask" ADD CONSTRAINT "SystemTask_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemTask" ADD CONSTRAINT "SystemTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_clientCommunicationId_fkey" FOREIGN KEY ("clientCommunicationId") REFERENCES "ClientCommunication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "SubdomainUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_systemTaskId_fkey" FOREIGN KEY ("systemTaskId") REFERENCES "SystemTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallIntelligence" ADD CONSTRAINT "CallIntelligence_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mockup" ADD CONSTRAINT "Mockup_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mockup" ADD CONSTRAINT "Mockup_designProjectId_fkey" FOREIGN KEY ("designProjectId") REFERENCES "DesignProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaintColor" ADD CONSTRAINT "PaintColor_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternateColor" ADD CONSTRAINT "AlternateColor_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedAccess" ADD CONSTRAINT "SharedAccess_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_bookingDataId_fkey" FOREIGN KEY ("bookingDataId") REFERENCES "SubBookingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
