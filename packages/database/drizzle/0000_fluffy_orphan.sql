-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SEQUENCE "public"."beers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."breweries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."eventbeerlist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."styles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "breweries" (
	"id" integer PRIMARY KEY DEFAULT nextval('breweries_id_seq'::regclass) NOT NULL,
	"name" varchar(80) NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beers" (
	"id" integer PRIMARY KEY DEFAULT nextval('beers_id_seq'::regclass) NOT NULL,
	"name" varchar(80) NOT NULL,
	"abv" double precision,
	"brewery_id" integer NOT NULL,
	"style_id" integer NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "styles" (
	"id" integer PRIMARY KEY DEFAULT nextval('styles_id_seq'::regclass) NOT NULL,
	"name" varchar(80) NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventbeerlist" (
	"id" integer PRIMARY KEY DEFAULT nextval('eventbeerlist_id_seq'::regclass) NOT NULL,
	"event_id" integer NOT NULL,
	"beer_id" integer NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY DEFAULT nextval('events_id_seq'::regclass) NOT NULL,
	"name" varchar(80) NOT NULL,
	"date" date NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" integer PRIMARY KEY DEFAULT nextval('stats_id_seq'::regclass) NOT NULL,
	"date" timestamp NOT NULL,
	"opinion" integer NOT NULL,
	"beer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
	"webuserid" varchar(80) NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beers" ADD CONSTRAINT "beers_brewery_id_fkey" FOREIGN KEY ("brewery_id") REFERENCES "public"."breweries"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "beers" ADD CONSTRAINT "beers_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "public"."styles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "eventbeerlist" ADD CONSTRAINT "eventbeerlist_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "public"."beers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "eventbeerlist" ADD CONSTRAINT "eventbeerlist_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "public"."beers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
*/