## Documentation
Notes
- Node version 14 is incompatible with sequelize - please use nvm to change your version to an earlier version (nvm is only avaliable on mac/linux - windows alternative: https://github.com/coreybutler/nvm-windows)

```bash
$ nvm use 12.19.0
```

Instructions
1. Locate into the willow_schemas directory and then install the necessary dependencies

```bash
$ npm install
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


    a. Install Postgres (windows: https://www.postgresql.org/download/windows/)

    ```bash
    $ brew install postgres
    ```
    *If you are using windows, you will need to set the path C:\Program Files\PostgreSQL\13\bin ;C:\Program Files\PostgreSQL\13\lib where version is 13
    
    b. Login to Postgres and create a Postgres database and Postgres user

     ```bash
    $ psql postgres
    postgres=# create database demo;
    postgres=# create user demouser;
    postgres=# \c demo
    demo=# GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO demouser;
    ```

4. Configure your database 
   For mac:
    ```bash
    export DATABASE_HOST=localhost
    export DATABASE_PORT=5432
    export DATABASE_USER=demouser
    export DATABASE_PASSWORD=
    export DATABASE_USE_SSL=false
    export DATABASE_NAME=demo
    ```
    
    For windows:
    ```bash
    set DATABASE_HOST=localhost
    set DATABASE_PORT=5432
    set DATABASE_USER=demouser
    set DATABASE_PASSWORD=
    set DATABASE_USE_SSL=false
    set DATABASE_NAME=demo
    ```

5. Generate Willow to apply the base

```bash
$ npm run willow-generate 
```

6. Sync the database
   For mac:
```bash
$ npm run sync-db
```
   For windows:
   ```bash
$ set DB_SYNC=true;node db.js;set DB_SYNC=false
```

7. Run Willow to start your backend 

```bash
$ npm run willow-start
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

10. Check if the data you entered has been added to the database

	a. Make sure you are accessing the demo database correctly
	
	```bash
	$ psql -U demouser demo
	```
    ```javascript 
	demo=# \d
	```
	
	b. Query the customer table
	
	```bash
   	demo=# select * from customer;
    ```

	
11. Stop the server and edit the base.yaml file by adding a new column. Then re-generate Willow again but this time with migrations

```bash
npm run willow-generate-migrate
```

*migration files can be created for new tables, new columns, deleted columns and changed type of column

12. Restart Willow
