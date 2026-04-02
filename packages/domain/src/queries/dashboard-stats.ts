import {sql} from 'drizzle-orm';

import {getDb} from '../db';
import type {
  ColdSpots,
  DashboardStats,
  DistributionBucket,
  StyleTrendBucket,
  TopBeer,
  TopBrewery,
  TypeCount,
  VelocityBucket,
} from '../types';

function queryKpis(eventId: number) {
  return getDb().execute<{
    total_checkins: string;
    active_users: string;
    unique_users: string;
    na_checkins: string;
  }>(sql`
    SELECT
      COUNT(*)::text AS total_checkins,
      COUNT(DISTINCT s.user_id) FILTER (
        WHERE s.date > NOW() - INTERVAL '15 minutes'
      )::text AS active_users,
      COUNT(DISTINCT s.user_id)::text AS unique_users,
      COUNT(*) FILTER (WHERE b.is_na = true)::text AS na_checkins
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    WHERE s.event_id = ${eventId}
  `);
}

function queryVelocity(eventId: number) {
  return getDb().execute<{
    bucket: string;
    total: string;
    na: string;
  }>(sql`
    SELECT
      to_char(
        date_trunc('hour', s.date) +
        (floor(extract(minute FROM s.date) / 5) * interval '5 minutes'),
        'HH12:MI AM'
      ) AS bucket,
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE b.is_na = true)::text AS na
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    JOIN events e ON e.id = s.event_id
    WHERE s.event_id = ${eventId}
      AND s.date::date = e.date
    GROUP BY date_trunc('hour', s.date) +
      (floor(extract(minute FROM s.date) / 5) * interval '5 minutes')
    ORDER BY date_trunc('hour', s.date) +
      (floor(extract(minute FROM s.date) / 5) * interval '5 minutes')
  `);
}

function queryTopBeers(eventId: number) {
  return getDb().execute<{
    name: string;
    brewery_name: string;
    count: string;
    recent_count: string;
  }>(sql`
    SELECT
      b.name,
      br.name AS brewery_name,
      COUNT(*)::text AS count,
      COUNT(*) FILTER (
        WHERE s.date > NOW() - INTERVAL '30 minutes'
      )::text AS recent_count
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    JOIN breweries br ON b.brewery_id = br.id
    WHERE s.event_id = ${eventId}
    GROUP BY b.id, b.name, br.name
    ORDER BY COUNT(*) DESC
    LIMIT 10
  `);
}

function queryTopBreweries(eventId: number) {
  return getDb().execute<{
    name: string;
    count: string;
    beer_count: string;
  }>(sql`
    SELECT
      br.name,
      COUNT(s.id)::text AS count,
      COUNT(DISTINCT b.id)::text AS beer_count
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    JOIN breweries br ON b.brewery_id = br.id
    WHERE s.event_id = ${eventId}
    GROUP BY br.id, br.name
    ORDER BY COUNT(s.id) DESC
    LIMIT 10
  `);
}

function queryByType(eventId: number) {
  return getDb().execute<{
    type: string;
    count: string;
  }>(sql`
    SELECT
      CASE WHEN b.is_na THEN 'NA' ELSE b.beverage_type::text END AS type,
      COUNT(*)::text AS count
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    WHERE s.event_id = ${eventId}
    GROUP BY CASE WHEN b.is_na THEN 'NA' ELSE b.beverage_type::text END
    ORDER BY COUNT(*) DESC
  `);
}

function queryStyleTrends(eventId: number) {
  return getDb().execute<{
    bucket: string;
    style: string;
    count: string;
  }>(sql`
    WITH top_styles AS (
      SELECT st.name
      FROM stats s
      JOIN beers b ON s.beer_id = b.id
      JOIN styles st ON b.style_id = st.id
      JOIN events e ON e.id = s.event_id
      WHERE s.event_id = ${eventId}
        AND s.date::date = e.date
      GROUP BY st.name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    )
    SELECT
      to_char(
        date_trunc('hour', s.date) +
        (floor(extract(minute FROM s.date) / 10) * interval '10 minutes'),
        'HH12:MI AM'
      ) AS bucket,
      CASE
        WHEN st.name IN (SELECT name FROM top_styles) THEN st.name
        ELSE 'Other'
      END AS style,
      COUNT(*)::text AS count
    FROM stats s
    JOIN beers b ON s.beer_id = b.id
    JOIN styles st ON b.style_id = st.id
    JOIN events e ON e.id = s.event_id
    WHERE s.event_id = ${eventId}
      AND s.date::date = e.date
    GROUP BY
      date_trunc('hour', s.date) +
        (floor(extract(minute FROM s.date) / 10) * interval '10 minutes'),
      CASE
        WHEN st.name IN (SELECT name FROM top_styles) THEN st.name
        ELSE 'Other'
      END
    ORDER BY
      date_trunc('hour', s.date) +
        (floor(extract(minute FROM s.date) / 10) * interval '10 minutes')
  `);
}

function queryBeersPerPerson(eventId: number) {
  return getDb().execute<{
    bucket: string;
    count: string;
  }>(sql`
    SELECT bucket, COUNT(*)::text AS count
    FROM (
      SELECT
        CASE
          WHEN cnt BETWEEN 1 AND 2 THEN '1-2'
          WHEN cnt BETWEEN 3 AND 5 THEN '3-5'
          WHEN cnt BETWEEN 6 AND 8 THEN '6-8'
          WHEN cnt BETWEEN 9 AND 12 THEN '9-12'
          WHEN cnt BETWEEN 13 AND 16 THEN '13-16'
          WHEN cnt BETWEEN 17 AND 20 THEN '17-20'
          ELSE '21+'
        END AS bucket,
        cnt
      FROM (
        SELECT user_id, COUNT(*) AS cnt
        FROM stats
        WHERE event_id = ${eventId}
        GROUP BY user_id
      ) per_user
    ) bucketed
    GROUP BY bucket
    ORDER BY MIN(cnt)
  `);
}

function queryColdSpots(eventId: number) {
  return getDb().execute<{
    name: string;
    cnt: string;
    beer_cnt: string;
    total_breweries: string;
    avg_checkins: string;
  }>(sql`
    WITH brewery_stats AS (
      SELECT
        br.id,
        br.name,
        COUNT(s.id) AS checkin_count,
        COUNT(DISTINCT ebl.beer_id) AS beer_count
      FROM breweries br
      JOIN beers b ON b.brewery_id = br.id
      JOIN eventbeerlist ebl ON ebl.beer_id = b.id AND ebl.event_id = ${eventId}
      LEFT JOIN stats s ON s.beer_id = b.id AND s.event_id = ${eventId}
      GROUP BY br.id, br.name
    )
    SELECT
      name,
      checkin_count::text AS cnt,
      beer_count::text AS beer_cnt,
      (SELECT COUNT(*) FROM brewery_stats)::text AS total_breweries,
      (SELECT COALESCE(AVG(checkin_count), 0)::int FROM brewery_stats)::text AS avg_checkins
    FROM brewery_stats
    ORDER BY checkin_count ASC
    LIMIT 3
  `);
}

function pivotStyleTrends(
  rows: {bucket: string; style: string; count: string}[],
): StyleTrendBucket[] {
  const map = new Map<string, StyleTrendBucket>();
  for (const row of rows) {
    let entry = map.get(row.bucket);
    if (!entry) {
      entry = {bucket: row.bucket};
      map.set(row.bucket, entry);
    }
    entry[row.style] = parseInt(row.count, 10);
  }
  return Array.from(map.values());
}

export async function dashboardStats(eventId: number): Promise<DashboardStats> {
  const [kpiRows, velocityRows, topBeerRows, topBreweryRows, typeRows, styleRows, perPersonRows, coldSpotRows] =
    await Promise.all([
      queryKpis(eventId),
      queryVelocity(eventId),
      queryTopBeers(eventId),
      queryTopBreweries(eventId),
      queryByType(eventId),
      queryStyleTrends(eventId),
      queryBeersPerPerson(eventId),
      queryColdSpots(eventId),
    ]);

  const kpi = kpiRows[0];

  const velocity: VelocityBucket[] = velocityRows.map((r) => ({
    bucket: r.bucket,
    total: parseInt(r.total, 10),
    na: parseInt(r.na, 10),
  }));

  const topBeers: TopBeer[] = topBeerRows.map((r) => ({
    name: r.name,
    breweryName: r.brewery_name,
    count: parseInt(r.count, 10),
    recentCount: parseInt(r.recent_count, 10),
  }));

  const topBreweries: TopBrewery[] = topBreweryRows.map((r) => ({
    name: r.name,
    count: parseInt(r.count, 10),
    beerCount: parseInt(r.beer_count, 10),
  }));

  const byType: TypeCount[] = typeRows.map((r) => ({
    type: r.type,
    count: parseInt(r.count, 10),
  }));

  const styleTrends = pivotStyleTrends(styleRows);

  const beersPerPerson: DistributionBucket[] = perPersonRows.map((r) => ({
    bucket: r.bucket,
    count: parseInt(r.count, 10),
  }));

  const firstColdSpot = coldSpotRows[0];
  const coldSpots: ColdSpots = {
    totalBreweries: firstColdSpot ? parseInt(firstColdSpot.total_breweries, 10) : 0,
    avgCheckins: firstColdSpot ? parseInt(firstColdSpot.avg_checkins, 10) : 0,
    breweries: coldSpotRows.map((r) => ({
      name: r.name,
      count: parseInt(r.cnt, 10),
      beerCount: parseInt(r.beer_cnt, 10),
    })),
  };

  return {
    totalCheckins: kpi ? parseInt(kpi.total_checkins, 10) : 0,
    activeUsers: kpi ? parseInt(kpi.active_users, 10) : 0,
    uniqueUsers: kpi ? parseInt(kpi.unique_users, 10) : 0,
    naCheckins: kpi ? parseInt(kpi.na_checkins, 10) : 0,
    velocity,
    topBeers,
    topBreweries,
    byType,
    styleTrends,
    beersPerPerson,
    coldSpots,
    generatedAt: new Date().toISOString(),
  };
}
