# Registration Form

A beautiful, interactive registration form built with Next.js and TypeScript that sends data to your webhook.

## Features

- ✨ Modern, clean UI with Tailwind CSS
- 🎯 Form validation with real-time feedback
- 🚀 Smooth animations and interactions
- 📱 Fully responsive design
- 🔒 Secure form submission to webhook
- ⚡ Built with Next.js and TypeScript

## Form Fields

- Full Name
- Guardian Name
- Class/Grade (dropdown)
- Language (dropdown)
- Location
- Email Address
- Password
- Confirm Password

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Webhook Integration

The form sends data in JSON format to: `https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN`

Data structure:
```json
{
  "fullName": "John Doe",
  "guardianName": "Jane Doe",
  "classGrade": "10th Grade",
  "language": "English",
  "location": "New York",
  "emailAddress": "john@example.com",
  "password": "securepassword"
}
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios for HTTP requests 