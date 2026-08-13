# Aquinas School Management System (Aquinas SMS)

Aquinas SMS is a comprehensive, full-stack Next.js web application designed to streamline school administration, academic tracking, admissions, and student elections. 

## Features

- **Dashboard & User Management:** Role-based access control (Admin, Teacher, Student) using NextAuth.
- **Academics & Records:** Manage academic years, semesters, classes, programmes, and subjects.
- **Student Admissions:** Handle the student admission process, payment tracking, and placement.
- **Examination & Assessments:** Record and track exam scores, Friday test scores, and generate automated SMS results.
- **Election System:** Built-in voting and election management system for Student Representative Council (SRC) or similar elections, complete with nominee management and voting payment tracking.
- **USSD Integration:** Integration with USSD sessions for tasks like remote voting or checking results.
- **Attendance Tracking:** Keep logs of student attendance and manage holidays.
- **Reporting & Exports:** Generate PDFs and Excel sheets for various reports and lists.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** TypeScript
- **Database:** MongoDB with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials, JWT, bcrypt)
- **UI & Styling:** 
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Material UI (MUI)](https://mui.com/)
- **File Uploads:** [Cloudinary](https://cloudinary.com/)
- **Data Export & Printing:** `@react-pdf/renderer`, `react-to-print`, `xlsx` (SheetJS)
- **Forms & Validation:** `react-hook-form`, `yup`

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for file uploads)
- PAYSTACK Account (for payment processing)
- ARKESEL Account (for SMS delivery)
- NPOINTU Account (for USSD and payment gateway integration)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd aquinas_sms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   Copy the example environment file and configure the necessary credentials:
   ```bash
   cp example.env .env.local
   ```
   *Make sure to fill in your MongoDB URI, NextAuth secret, Cloudinary keys, and other required environment variables.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/`: Next.js App Router containing pages and API routes (`(auth)`, `(mainapp)`, `api`).
- `src/components/`: Reusable UI components.
- `src/models/`: Mongoose schemas and models (Student, Election, ExamScore, etc.).
- `src/lib/` & `src/utils/`: Utility functions, database connection logic, and API service wrappers.
- `src/hooks/`: Custom React hooks.
- `src/context/`: React context providers for state management.
- `src/types/`: TypeScript type definitions.

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
