import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import Logo from '@/assets/logo.png';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<>
				<Image
					className="rounded-xl border"
					src={Logo}
					alt="Logo"
					width={32}
					height={32}
				/>
				<span>Modbox</span>
			</>
		),
	},
};
