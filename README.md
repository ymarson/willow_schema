## Installation

1. Locate into the willow_schemas directory and then install the necessary dependencies

```bash
npm install
```

2. Make changes to the base.yaml file. These changes should reflect the way you want to structure your backend (relations etc) e.g

```yaml
Relations:

  - Customer:
      columns: [id: Int, first_name: String, last_name: String, tier_id: Int, created_date: Date]
      queries: [all-all]
  - Message:
      columns: [id: Int, customer_id: Int, body: String, message_type_id: Int]
      queries: [all-all]
  - Order:
      columns: [id: Int, customer_id: Int, product_id: Int, body: String, created_date: Date]
      queries: [all-all] 
```
3. Set up Postgres database - this database should exist and you will need to have access to it:
    a. Install Postgres 

    ```bash
    brew install postgres
    ```

    b. Login to Postgres and create a Postgres database and Postgres user

     ```bash
    psql
    create database demo
    create user demouser
    ```

    c. Go to db/connection.js and assign the values to the databaseName and databaseUser variables:

    ```javascript
    const databaseName= process.env.DATABASE_NAME || 'demo';
    const databaseUser = process.env.DATABASE_USER || 'demouser'
    ```
    d. Export your database variables:

    ```bash
    export DATABASE_HOST=localhost
    export DATABASE_PORT=5432
    export DATABASE_USER=platform
    export DATABASE_PASSWORD=
    export DATABASE_USE_SSL=false
    export DATABASE_NAME=demo
    ```

4. Generate Willow to apply these changes, use migrate flag optionally to run with migrations

```bash
npm run willow-generate 
```
or

```bash
npm run willow-generate-migrate
```

5. Sync the database

```bash
npm run sync-db
```

6. Run Willow to start your backend 

```bash
npm run willow-start
```

7. Open http://localhost:3000

8. Add data by mutation via GraphQL or by inserting manually in Postgres

e.g of mutation:

```javascript
mutation { 
	addMessage(id: 6, customer_id: 44, body: "Hello there", message_type_id: 5)
	{ id } 
}
```

e.g of adding manually

```javascript
demo2=# insert into message (id, customer_id, body, message_type_id) values (6, 44, 'Hello there', 5);
```
