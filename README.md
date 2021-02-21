# dm_challenge

## Preparing our Enviroment

After cloning the repository we should run the following command at the terminal to install its dependencies.

```
- npm i
```

It is important to copy the content present at `.env.example` file to a new file named `.env` before we proceed.

After finishing it, we should prepare our enviroment:

```
- npm run postgres:start
- npm run database:create
- npm run migration:run
- npm run populate
```

They're responsible to download Postgres' Docker Image, creating our database, running our migrations to create our database structure and populate it with our CSV's data.

To put our connection with our Stock Service we need to turn it on:

```
- docker-compose up
```

Finally, we can put our server up using:

```
- npm run dev
```

## Endpoints

- Return product's name, price and quantity in stock:

```
[GET] /products/:name

{
  "name": "Brazil nut",
  "price": 5.16,
  "quantity": 5
}
```

- Return all approved orders with its products and its cost:

```
[GET] /orders

{
  "orders": [
      {
        "id": "123",
        "products": [
          {
            "name": "Watermelon",
            "quantity": 2,
            "price": 5.47
          }
         ],
        "total": 10.94
     }
  ]
}
```

- Return a specific order with its products and its cost, given a **id**:

```
[GET] /orders/:id
```

- Return a specific order with its products and its cost:

```
[GET] /orders/:id

{
  "id": "456",
  "products": [
    {
      "name": "Coffee",
      "quantity": 3,
      "price": 2.43
    }
  ],
  "total": 7.29
}
```
- Register a new order, if there is all products ordered available:

```
[POST] /orders

- BODY

{
  "products": [
    {
      "name": "Kiwi",
      "quantity": 1
    }
  ]
}

- RESPONSE

{
  "name": "Brazil nut",
  "price": 5.16,
  "quantity": 5
}
```
