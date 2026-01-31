

# Seed County Mappings for 53 US Metropolitan Statistical Areas

Populate the `metro_counties` table with the official county compositions for each MSA. This enables the `auto-assign-place-geography` edge function to automatically map places to their correct metro area based on reverse-geocoded county data.

## Data Structure

Each record in `metro_counties` requires:
- `metro_id`: UUID reference to the metro in `geo_areas`
- `county_name`: County name without "County" suffix (e.g., "Dallas" not "Dallas County")
- `state_code`: Two-letter state abbreviation (e.g., "TX")
- `country_code`: "US" for all records

## County Mappings by Metro (Principal Counties)

For practical auto-assignment, we'll seed the **principal counties** for each MSA (typically 2-8 counties that contain the majority of population and places). Full MSA definitions can include 10+ counties, but the core counties handle 90%+ of use cases.

| Metro | Principal Counties |
|-------|-------------------|
| New York-Newark-Jersey City | New York/Kings/Queens/Bronx/Richmond (NY), Hudson/Essex/Bergen/Passaic (NJ) |
| Los Angeles-Long Beach-Anaheim | Los Angeles, Orange (CA) |
| Chicago-Naperville-Elgin | Cook, DuPage, Lake, Will, Kane (IL) |
| Dallas-Fort Worth-Arlington | Dallas, Tarrant, Collin, Denton (TX) |
| Houston-The Woodlands-Sugar Land | Harris, Fort Bend, Montgomery (TX) |
| Washington-Arlington-Alexandria | District of Columbia (DC), Fairfax/Arlington/Loudoun (VA), Montgomery/Prince George's (MD) |
| Philadelphia-Camden-Wilmington | Philadelphia, Montgomery, Bucks, Delaware, Chester (PA) |
| Miami-Fort Lauderdale-Pompano Beach | Miami-Dade, Broward, Palm Beach (FL) |
| Atlanta-Sandy Springs-Alpharetta | Fulton, DeKalb, Gwinnett, Cobb, Clayton (GA) |
| Boston-Cambridge-Newton | Suffolk, Middlesex, Norfolk, Essex (MA) |
| Phoenix-Mesa-Chandler | Maricopa, Pinal (AZ) |
| San Francisco-Oakland-Berkeley | San Francisco, Alameda, Contra Costa, Marin (CA) |
| *... (41 more metros with their principal counties)* |

## Database Insertion

Total records: ~180 county mappings across 53 metros

```sql
INSERT INTO public.metro_counties (metro_id, county_name, state_code, country_code)
VALUES
  -- Dallas-Fort Worth
  ('66efc527-4f1c-4c9d-8ace-4685e1873a88', 'Dallas', 'TX', 'US'),
  ('66efc527-4f1c-4c9d-8ace-4685e1873a88', 'Tarrant', 'TX', 'US'),
  ('66efc527-4f1c-4c9d-8ace-4685e1873a88', 'Collin', 'TX', 'US'),
  ('66efc527-4f1c-4c9d-8ace-4685e1873a88', 'Denton', 'TX', 'US'),
  -- ... all other metros
```

## How Auto-Assignment Works After Seeding

1. Admin approves a place in Dallas
2. `auto-assign-place-geography` edge function triggers
3. Reverse geocodes place coordinates → finds "Dallas County, TX"
4. Calls `find_metro_for_county('Dallas', 'TX')`
5. Matches against `metro_counties` table → finds Dallas-Fort Worth metro
6. Inserts record into `place_geo_areas` linking place to metro
7. Place now appears in Dallas-Fort Worth metro filtering

## Files

| File | Action | Description |
|------|--------|-------------|
| Database insert | Execute | Insert ~180 county mappings into `metro_counties` table |

No code changes required - the existing `auto-assign-place-geography` function and `find_metro_for_county` RPC already consume this data.

