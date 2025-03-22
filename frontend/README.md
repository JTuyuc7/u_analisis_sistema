# Next.js Dashboard Application

This is a Next.js application with authentication, routing, and state management using Redux. It includes a dashboard with various features such as transaction management, user profiles, and an admin panel.

## Features

- User authentication (login and signup)
- Dashboard with sidebar navigation
- Transaction management and history
- User profile management
- Admin panel (for users with admin role)
- Responsive design using Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
fronted/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   │   ├── home/
│   │   │   ├── transactions/
│   │   │   ├── profile/
│   │   │   ├── history/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Sidebar.tsx
│   └── lib/
│       └── redux/
│           ├── store.ts
│           └── slices/
│               └── authSlice.ts
├── public/
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## TODO

- Implement API routes for authentication
- Add error handling and loading states
- Implement form validation
- Set up data fetching for dashboard components
- Implement authentication middleware

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
