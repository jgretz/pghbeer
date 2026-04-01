ALTER TABLE "beers" ALTER COLUMN "beverage_type" SET DEFAULT 'beer';--> statement-breakpoint
ALTER TABLE "beers" ALTER COLUMN "beverage_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "beers" ALTER COLUMN "is_na" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "beers" ALTER COLUMN "is_na" SET NOT NULL;