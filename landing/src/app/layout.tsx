import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "uEdu - English Academy Management System",
  description: "Modernize your English academy with comprehensive management tools for students, teachers, courses, and exams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
