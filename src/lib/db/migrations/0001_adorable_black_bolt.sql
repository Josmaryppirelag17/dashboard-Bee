CREATE TABLE "bee"."audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bee"."sessions" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "bee"."sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "bee"."sessions" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "email_token" varchar(255);--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "failed_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "last_login_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "bee"."users" ADD COLUMN "role" varchar(20) DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "bee"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bee"."users"("id") ON DELETE set null ON UPDATE no action;