import Link from "next/link";
import Navbar from "./components/navbar";
import "./globals.css";
import styles from "./page.module.css";

export const metadata = {
	title: "Selfie",
	description: "Generated by Next.js"
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>{/* Global styles */}</head>
			<body>
				<header className={styles.header}>
					<Link
						href="/"
						style={{ textDecoration: "none", color: "inherit" }}
					>
						<h1>{metadata.title}</h1>
					</Link>
					<Navbar />
				</header>
				<main>{children}</main>
			</body>
		</html>
	);
}
