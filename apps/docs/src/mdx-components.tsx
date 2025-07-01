import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import * as StepsComponents from 'fumadocs-ui/components/steps';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		...StepsComponents,
		img: (props) => <ImageZoom {...(props as any)} />,
		...components,
	};
}
