CREATE SEQUENCE "public"."map_layouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."map_slots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "map_layouts" (
	"id" integer PRIMARY KEY DEFAULT nextval('map_layouts_id_seq'::regclass) NOT NULL,
	"event_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"width" integer DEFAULT 1000 NOT NULL,
	"height" integer DEFAULT 1000 NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_slots" (
	"id" integer PRIMARY KEY DEFAULT nextval('map_slots_id_seq'::regclass) NOT NULL,
	"layout_id" integer NOT NULL,
	"label" varchar(24) NOT NULL,
	"kind" varchar(16) DEFAULT 'table' NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"width" double precision DEFAULT 40 NOT NULL,
	"height" double precision DEFAULT 40 NOT NULL,
	"rotation" double precision DEFAULT 0 NOT NULL,
	"brewery_id" integer,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "map_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "map_layouts" ADD CONSTRAINT "map_layouts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "map_slots" ADD CONSTRAINT "map_slots_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "public"."map_layouts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "map_slots" ADD CONSTRAINT "map_slots_brewery_id_fkey" FOREIGN KEY ("brewery_id") REFERENCES "public"."breweries"("id") ON DELETE set null ON UPDATE cascade;