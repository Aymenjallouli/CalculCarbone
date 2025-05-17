CREATE TABLE "calculation_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"merchandise_input" json,
	"transport_input" json,
	"event_input" json,
	"study_trip_input" json,
	"results" json,
	"created_at" text DEFAULT 'NOW()' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "calculation_results" ADD CONSTRAINT "calculation_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;