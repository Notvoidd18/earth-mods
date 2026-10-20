CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(64) DEFAULT 'DIRECTIVE' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"author_name" varchar(100) DEFAULT 'Directorate General',
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planetary_crises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"emergency_decree" text NOT NULL,
	"severity" varchar(32) DEFAULT 'CLASS_1_EXISTENTIAL' NOT NULL,
	"declared_by" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"declared_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "planetary_crises" ADD CONSTRAINT "planetary_crises_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_announcements_published" ON "announcements" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_announcements_priority" ON "announcements" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_announcements_created_at" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_crises_active" ON "planetary_crises" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_crises_complaint" ON "planetary_crises" USING btree ("complaint_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_crises_single_active" ON "planetary_crises" ("is_active") WHERE "is_active" = true;