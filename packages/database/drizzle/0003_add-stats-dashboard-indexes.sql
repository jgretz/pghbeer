CREATE INDEX "stats_event_id_date_idx" ON "stats" USING btree ("event_id","date");--> statement-breakpoint
CREATE INDEX "stats_event_id_user_id_idx" ON "stats" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "stats_event_id_beer_id_idx" ON "stats" USING btree ("event_id","beer_id");