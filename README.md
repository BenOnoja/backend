---


---

## **Clone the Repository**

To clone this repository and set it up locally, follow these steps:

1. Open your terminal or command prompt.
2. Run the following command to clone the repository:
   ```bash
   git clone https://github.com/BenOnoja/backend.git
   ```
3. Navigate to the project folder:
   ```bash
   cd backend
   npm install
   ```
This is when you're testing the serverless app before deployment. When you're sure the application is ready for deployment, simply run
```bash
vercel
```
---

## **Project Use**

This project is a **Telegram Mini App** that allows users to:
- **Interact with Telegram APIs** for user authentication and data fetching.
- **Perform CRUD operations** on books, users, and transactions using a PostgreSQL database.
- **Enable Buyers and Sellers** to connect and trade books within the app.


---


---

## */.env*
```text
DATABASE_URL='your database connection url goes in here'
PAYSTACK_SECRET_KEY='secret key for paystack transaction (test)'
BLOB_READ_WRITE_TOKEN='your vercel blob read and write token if you are using vercel blob'
```

