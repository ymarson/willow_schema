## Installation

1. Locate into the willow_schemas directory and then install the necessary dependencies

```bash
npm install
```

2. Make changes to the base.yaml file. These changes should reflect the way you want to structure your backend (relations etc) e.g

```yaml
Relations:

  - Customer:
      columns: [id: Int, first_name: String, last_name: String, created_date: Date]
      queries: [all-all, byone-customer_id]
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

5. Generate Willow to apply these changes

```bash
npm run willow-generate 
```
or

```bash
npm run willow-generate-migrate
```

*migration files will be created for new tables, new columns, deleted columns and changed type of column

5. Sync the database

```bash
npm run sync-db
```

6. Run Willow to start your backend 

```bash
npm run willow-start
```

7. Open http://localhost:3000

8. 
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


9. Stop the server and re-generate Willow again but this time with migrations

```bash
npm run willow-generate-migrate
```

*migration files will be created for new tables, new columns, deleted columns and changed type of column
