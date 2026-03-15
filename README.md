# CrownMarket 👑

A premium e-commerce web application built for an internship task. This project features a completely Custom Vanilla JS frontend and a Node.js/Express backend with SQLite.

## ✨ Features
* **Shopping Cart:** Add, remove, and auto-calculate total item prices.
* **Product Details:** dynamically generated product views.
* **Order Processing:** Authenticated users can securely check out their cart.
* **User Authentication:** Registration and Login systems utilizing `bcrypt` for password hashing and `jsonwebtoken` (JWT) for secure session handling.
* **Responsive Design:** Premium UI featuring glassmorphism and modern aesthetics.

## 🛠️ Technology Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (No frameworks)
* **Backend:** Node.js, Express.js
* **Database:** SQLite3

---

## 🚀 How to Run Locally

If you are cloning this project to review or run it locally, please follow these steps:

### 1. Clone the Repository
Open your terminal and clone the repo to your local machine:
```bash
git clone https://github.com/Aashkhop/ImprovingTasks.git
cd ImprovingTasks
```

### 2. Setup the Backend
Open a terminal and navigate to the backend folder:
```bash
cd backend
```
Install the backend dependencies:
```bash
npm install
```
Start the backend server:
```bash
node server.js
```
*The server will run on `http://localhost:5000` and automatically create/seed the SQLite database (`crownmarket.db`).*

### 3. Setup the Frontend
Open a **new, split terminal window** and navigate to the frontend folder:
```bash
cd frontend
```
Install the frontend server dependency:
```bash
npm install serve
```
Start the frontend development server:
```bash
npx serve
```
*(Alternatively, you can use the VS Code "Live Server" extension on the `frontend/index.html` file.)*

### 4. Open the App
By default, `npx serve` will host the frontend at **http://localhost:3000** (or whatever port it specifies in the terminal). Open that link in your browser to view CrownMarket!
