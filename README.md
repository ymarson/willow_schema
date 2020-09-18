## Documentation

1. Locate into the willow_schemas directory and then install the necessary dependencies

```bash
npm install
```

2. Check the base.yaml file. This file should reflect the way you want to structure your backend (relations etc) e.g

```yaml
Relations:

  - Customer:
      columns: [id: Int, first_name: String, last_name: String, created_date: Date]
      queries: [all-all]
  - Message:
      columns: [id: Int, customer_id: Int, body: String, message_type_id: Int, created_date: Date]
      queries: [all-all, by-pk]
```

3. Set up Postgres database - this database should exist and you will need to have access to it (skip if already have a working database)


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

4. Configure your database 
  
    ```bash
    export DATABASE_HOST=localhost
    export DATABASE_PORT=5432
    export DATABASE_USER=platform
    export DATABASE_PASSWORD=
    export DATABASE_USE_SSL=false
    export DATABASE_NAME=demo
    ```

5. Generate Willow to apply the base

```bash
npm run willow-generate 
```

6. Sync the database

```bash
npm run sync-db
```

7. Run Willow to start your backend 

```bash
npm run willow-start
```

8. Open http://localhost:3000

9. 
    a. Add data by using a mutation in GraphQL 

    ```javascript
    mutation add_customer {
        addCustomer(first_name: "Claudia", last_name: "Nobrega") {
            id
            first_name
        }
    }
    ```

    b. Query for the data you just entered

    ```javascript
    query get_customers {
        customers {
		id 
        	first_name
        	last_name
        }
    }
    ```


10. Stop the server and edit the base.yaml file (e.g add a new table). Then re-generate Willow again but this time with migrations

```bash
npm run willow-generate-migrate
```

*migration files can be created for new tables, new columns, deleted columns and changed type of column

11. Restart Willow
