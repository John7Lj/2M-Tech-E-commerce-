# 2M Tech E-commerce Suite

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)


A comprehensive, full-stack e-commerce solution featuring a modern client-side storefront, a powerful administrative dashboard, and a robust Node.js backend.

## Project Structure

- **`client/`**: The modern React storefront for customers.
- **`admin/`**: The administrative management panel for products, orders, and settings.
- **`server/`**: The Express/Node.js backend API with MongoDB integration.

## Features

- ✨ **Dynamic Storefront**: Responsive UI with product filtering and featured sections.
- 🛡️ **Admin Panel**: Complete management of inventory, categories, and settings.
- 🔐 **Secure Authentication**: Firebase-powered auth with role-based access control (RBAC).
- 📦 **Order Management**: Real-time order tracking and processing.
- 🎨 **Modern Stack**: Built with React, TypeScript, Tailwind CSS, Express, and MongoDB.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account
- Firebase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```

2. Follow the setup instructions in each directory's `README.md` and copy the provided `.env.example` files to `.env` with your credentials.

3. Install dependencies and start the development servers:
   ```bash
   # Root
   npm install

   # Client
   cd client && npm install && npm run dev

   # Admin
   cd admin && npm install && npm run dev

   # Server
   cd server && npm install && npm run dev
   ```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[MIT](LICENSE)