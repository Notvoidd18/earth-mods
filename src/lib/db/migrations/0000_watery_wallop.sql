CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid,
	"action" varchar(64) NOT NULL,
	"target_type" varchar(32) NOT NULL,
	"target_id" varchar(64) NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" varchar(32) NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(64) NOT NULL,
	"author_name" varchar(60),
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING_REVIEW' NOT NULL,
	"verdict" text,
	"verdict_by" varchar(100),
	"verdict_date" timestamp with time zone,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"downvotes_count" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "complaints_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "moderators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'MODERATOR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "moderators_username_unique" UNIQUE("username"),
	CONSTRAINT "moderators_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"reason" varchar(64) NOT NULL,
	"details" text,
	"reporter_hash" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"moderator_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"voter_hash" varchar(64) NOT NULL,
	"vote_type" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_complaint_voter" UNIQUE("complaint_id","voter_hash")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_moderator_id_moderators_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."moderators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_moderator_id_moderators_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."moderators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_complaints_case_number" ON "complaints" USING btree ("case_number");--> statement-breakpoint
CREATE INDEX "idx_complaints_status" ON "complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_complaints_category" ON "complaints" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_complaints_score" ON "complaints" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_complaints_created_at" ON "complaints" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_moderators_username" ON "moderators" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_reports_complaint" ON "reports" USING btree ("complaint_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sessions_token_hash" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_votes_complaint" ON "votes" USING btree ("complaint_id");