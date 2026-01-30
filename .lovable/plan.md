

# Seed US Metropolitan Statistical Areas (MSAs)

Populate the `geo_areas` table with the top 50+ US Metropolitan Statistical Areas based on Census Bureau definitions. This enables the Metro Area dropdown in the Place Edit modal and supports the automatic place-to-metro assignment pipeline.

## Data Source

US Census Bureau Metropolitan Statistical Areas (MSAs) - official delineations used for federal statistics. These are multi-county regions anchored by urban centers with populations over 50,000.

## Database Migration

Insert records into `geo_areas` with:
- `name`: Official MSA name (e.g., "Dallas-Fort Worth-Arlington, TX")
- `slug`: URL-friendly identifier (e.g., "dallas-fort-worth")
- `type`: 'metro'
- `is_active`: true
- `centroid_lat` / `centroid_lng`: Geographic center coordinates

### Metro Areas to Seed (Top 53 by Population)

| Rank | Metro Area | Center Coords |
|------|-----------|---------------|
| 1 | New York-Newark-Jersey City, NY-NJ-PA | 40.7128, -74.0060 |
| 2 | Los Angeles-Long Beach-Anaheim, CA | 34.0522, -118.2437 |
| 3 | Chicago-Naperville-Elgin, IL-IN-WI | 41.8781, -87.6298 |
| 4 | Dallas-Fort Worth-Arlington, TX | 32.7767, -96.7970 |
| 5 | Houston-The Woodlands-Sugar Land, TX | 29.7604, -95.3698 |
| 6 | Washington-Arlington-Alexandria, DC-VA-MD-WV | 38.9072, -77.0369 |
| 7 | Philadelphia-Camden-Wilmington, PA-NJ-DE-MD | 39.9526, -75.1652 |
| 8 | Miami-Fort Lauderdale-Pompano Beach, FL | 25.7617, -80.1918 |
| 9 | Atlanta-Sandy Springs-Alpharetta, GA | 33.7490, -84.3880 |
| 10 | Boston-Cambridge-Newton, MA-NH | 42.3601, -71.0589 |
| 11 | Phoenix-Mesa-Chandler, AZ | 33.4484, -112.0740 |
| 12 | San Francisco-Oakland-Berkeley, CA | 37.7749, -122.4194 |
| 13 | Riverside-San Bernardino-Ontario, CA | 33.9806, -117.3755 |
| 14 | Detroit-Warren-Dearborn, MI | 42.3314, -83.0458 |
| 15 | Seattle-Tacoma-Bellevue, WA | 47.6062, -122.3321 |
| 16 | Minneapolis-St. Paul-Bloomington, MN-WI | 44.9778, -93.2650 |
| 17 | San Diego-Chula Vista-Carlsbad, CA | 32.7157, -117.1611 |
| 18 | Tampa-St. Petersburg-Clearwater, FL | 27.9506, -82.4572 |
| 19 | Denver-Aurora-Lakewood, CO | 39.7392, -104.9903 |
| 20 | St. Louis, MO-IL | 38.6270, -90.1994 |
| 21 | Baltimore-Columbia-Towson, MD | 39.2904, -76.6122 |
| 22 | Orlando-Kissimmee-Sanford, FL | 28.5383, -81.3792 |
| 23 | Charlotte-Concord-Gastonia, NC-SC | 35.2271, -80.8431 |
| 24 | San Antonio-New Braunfels, TX | 29.4241, -98.4936 |
| 25 | Portland-Vancouver-Hillsboro, OR-WA | 45.5152, -122.6784 |
| 26 | Sacramento-Roseville-Folsom, CA | 38.5816, -121.4944 |
| 27 | Pittsburgh, PA | 40.4406, -79.9959 |
| 28 | Austin-Round Rock-Georgetown, TX | 30.2672, -97.7431 |
| 29 | Las Vegas-Henderson-Paradise, NV | 36.1699, -115.1398 |
| 30 | Cincinnati, OH-KY-IN | 39.1031, -84.5120 |
| 31 | Kansas City, MO-KS | 39.0997, -94.5786 |
| 32 | Columbus, OH | 39.9612, -82.9988 |
| 33 | Cleveland-Elyria, OH | 41.4993, -81.6944 |
| 34 | Indianapolis-Carmel-Anderson, IN | 39.7684, -86.1581 |
| 35 | San Jose-Sunnyvale-Santa Clara, CA | 37.3382, -121.8863 |
| 36 | Nashville-Davidson-Murfreesboro-Franklin, TN | 36.1627, -86.7816 |
| 37 | Virginia Beach-Norfolk-Newport News, VA-NC | 36.8529, -75.9780 |
| 38 | Providence-Warwick, RI-MA | 41.8240, -71.4128 |
| 39 | Milwaukee-Waukesha, WI | 43.0389, -87.9065 |
| 40 | Jacksonville, FL | 30.3322, -81.6557 |
| 41 | Oklahoma City, OK | 35.4676, -97.5164 |
| 42 | Raleigh-Cary, NC | 35.7796, -78.6382 |
| 43 | Memphis, TN-MS-AR | 35.1495, -90.0490 |
| 44 | Richmond, VA | 37.5407, -77.4360 |
| 45 | New Orleans-Metairie, LA | 29.9511, -90.0715 |
| 46 | Louisville/Jefferson County, KY-IN | 38.2527, -85.7585 |
| 47 | Salt Lake City, UT | 40.7608, -111.8910 |
| 48 | Hartford-East Hartford-Middletown, CT | 41.7658, -72.6734 |
| 49 | Birmingham-Hoover, AL | 33.5207, -86.8025 |
| 50 | Buffalo-Cheektowaga, NY | 42.8864, -78.8784 |
| 51 | Rochester, NY | 43.1566, -77.6088 |
| 52 | Grand Rapids-Kentwood, MI | 42.9634, -85.6681 |
| 53 | Tucson, AZ | 32.2226, -110.9747 |

## SQL Migration

```sql
INSERT INTO public.geo_areas (name, slug, type, is_active, centroid_lat, centroid_lng)
VALUES
  ('New York-Newark-Jersey City, NY-NJ-PA', 'new-york', 'metro', true, 40.7128, -74.0060),
  ('Los Angeles-Long Beach-Anaheim, CA', 'los-angeles', 'metro', true, 34.0522, -118.2437),
  -- ... all 53 metros
ON CONFLICT DO NOTHING;
```

## After Implementation

1. **Immediate**: Metro dropdown in Place Edit modal shows 53 options
2. **Admin workflow**: Select metro when editing/creating places
3. **County mappings**: Use existing Metro Management page (`/admin/directory/metros`) to add county mappings for auto-assignment
4. **Extensible**: New metros can be added via admin UI as needed

## Files

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Insert 53 US metro areas into `geo_areas` table |

No code changes required - the `useMetroAreas` hook and admin UI already support reading from `geo_areas`.

