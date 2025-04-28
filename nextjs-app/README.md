# Yelp Dishes Next.js API

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your database credentials in `.env.local`:
   ```env
   POSTGRES_URL=postgres://<username>:<password>@<host>:<port>/<database>
   ```

## API Endpoints

- **GET `/api/get_popular_dishes?page_size=10&page_offset=0`**
  - Returns a paginated list of popular dishes (with photo URLs)

- **GET `/api/get_dish?dish_id=1&page_size=10&page_offset=0`**
  - Returns example photos of the dish from different businesses

- **GET `/api/get_business?business_id=3`**
  - Returns example photos of every dish served at the business, with business info

## Running the App

```sh
npm run dev
```

## Notes
- All endpoints use your Postgres stored procedures.
- Ensure your database is up to date and accessible from your dev environment.
