import type { PropsWithChildren } from "react";

interface DemoLayoutProps {
	title: string;
	description?: string;
}

export default function DemoLayout({
	description,
	title,
	children,
}: PropsWithChildren<DemoLayoutProps>) {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<div
				style={{
					height: 50,
					width: "100%",
					background: "#030303",
				}}
			>
				<span>{title}</span>
				<span>{description}</span>
			</div>
			{children}
		</div>
	);
}
