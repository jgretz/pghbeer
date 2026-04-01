CREATE TYPE "public"."beverage_type" AS ENUM('beer', 'wine', 'mead', 'cocktail', 'cider', 'seltzer', 'hard_tea');--> statement-breakpoint
ALTER TABLE "beers" ADD COLUMN "beverage_type" "beverage_type";--> statement-breakpoint
ALTER TABLE "beers" ADD COLUMN "is_na" boolean;