# E-Commerce Backend API

A robust RESTful e-commerce backend built with **Spring Boot**, **Spring Data JPA**, and **PostgreSQL**.

## 🚀 Features
* **User Management:** Handle user accounts and authentication data.
* **Product Catalog:** Support for single and batch product creation, retrieval, updates (`PATCH`), and deletion (`DELETE`).
* **Relational Database:** Integrated with PostgreSQL using Hibernate ORM for seamless data persistence.
* **Input Validation:** Built-in request validation using Jakarta Validation annotations.

## 🛠️ Tech Stack
* **Java** (Spring Boot)
* **Spring Data JPA** (Hibernate)
* **PostgreSQL**
* **Maven**

## 📡 API Endpoints (Product)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/product` | Retrieve all products |
| `POST` | `/product/new` | Create one or multiple products |
| `PATCH` | `/product/{id}` | Update product details |
| `DELETE` | `/product/{id}` | Remove a product |

## ⚙️ Getting Started
1. Clone the repository.
2. Create a PostgreSQL database (e.g., `ecommerce_db`).
3. Update your `application.properties` with your database credentials.
4. Run the application via your IDE or terminal:
   ```bash
   mvn spring-boot:run
