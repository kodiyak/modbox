import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Geist as Font_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

const sans = Font_Sans({
	subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={sans.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
