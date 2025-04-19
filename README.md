# Womens-care-BE

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A backend project for managing a women's care platform, built with Node.js, Express, and MongoDB. This project includes features for Super Admins, Branch Admins, Delivery Boys, and Users, with a modular and scalable architecture.

---

## 📁 Folder Structure
Womens-care-BE/ ├── .env # Environment variables ├── .gitignore # Git ignore file ├── index.js # Entry point of the application ├── package.json # Project dependencies and scripts ├── README.md # Project documentation ├── config/ # Configuration files │ ├── cloudinary.js # Cloudinary configuration │ ├── db.js # MongoDB connection setup │ ├── twilo.js # Twilio configuration ├── controllers/ # Controllers for handling business logic │ ├── branchAdmin-Controllers/ │ ├── deliveryBoy-Controllers/ │ ├── SuperAdmin-Controllers/ │ ├── UserControllers/ ├── middlewares/ # Middleware for authentication and validation │ ├── branchAdminMiddleware.js │ ├── deliveryBoyAuthMiddleware.js │ ├── superAdminMiddleware.js │ ├── userAuthMiddleware.js ├── models/ # Database models │ ├── BranchAdminModels/ │ ├── DeliveryBoyModel/ │ ├── SuperAdminModels/ │ ├── UserModels/ ├── routes/ # API routes │ ├── BranchAdmin-Routes/ │ ├── DeliveryBoyRoutes/ │ ├── SuperAdmin-Routes/ │ ├── user-Routes/ ├── utils/ # Utility functions


---

## 📂 Controller Descriptions

### Super Admin Controllers
- **branchAdmin-Controllers/**: Handles CRUD operations for branch admins, including creating, updating, and deleting branch admin accounts.
- **deliveryBoy-Controllers/**: Manages delivery boy accounts, including assigning delivery tasks and updating statuses.
- **SuperAdmin-Controllers/**: Includes routes for managing banners, products, testimonials, and dashboard analytics.
- **UserControllers/**: Handles user-related operations like authentication, profile management, and order history.

### Branch Admin Controllers
- **branchAdminDetailsRoutes**: Manages branch-specific details like branch settings and delivery boy assignments.
- **branchAdminProductRoutes**: Handles product management for branch admins, including inventory updates.

### User Controllers
- **userRoutes**: Manages user authentication and profile updates.
- **userProductRoutes**: Handles product browsing and search functionality for users.
- **cartRoutes**: Manages user cart operations like adding, updating, and removing items.
- **userOrderRoutes**: Handles order placement and tracking for users.

### Delivery Boy Controllers
- **deliveryBoyRoutes**: Manages delivery boy authentication and profile updates.
- **deliveryBoyOrderRoutes**: Handles delivery task assignments and status updates.

---

## 🔄 Data Flow Overview

1. **Client**: Sends a request (e.g., GET, POST) to the server.
2. **Route**: The request is routed to the appropriate route file based on the endpoint.
3. **Middleware**: Authentication or validation middleware is applied (if required).
4. **Controller**: The controller processes the request and calls the necessary service or model.
5. **Service (if exists)**: Contains business logic (optional layer).
6. **Model**: Interacts with the MongoDB database to fetch or update data.
7. **Database**: MongoDB stores and retrieves the required data.
8. **Response**: The processed data is sent back to the client.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Womens-care-BE.git