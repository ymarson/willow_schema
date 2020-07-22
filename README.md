## Installation

1. Install the necessary dependencies

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
      columns: [id: Int, customer_id: Int, body: String, inout: Int, message_type_id: Int, created_date: Date]
      queries: [all-all]
  - Order:
      columns: [id: Int, customer_id: Int, product_id: Int, body: String, created_date: Date]
      queries: [all-all] 
```

3. Generate Willow to apply these changes

```bash
npm run willow-generate
```

4. Run Willow to start your backend 

```bash
npm run willow-start
```