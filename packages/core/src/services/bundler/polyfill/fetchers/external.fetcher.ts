import { defineFetcher } from "../../utils";

export function createExternalFetcher() {
	return defineFetcher({
		fetch: async ({ url, options, next }, { logger }) => {
			if (url.startsWith("external://")) {
				const path = url.replace("external://", "");
				const externalURL = new URL(path, "https://esm.sh/");
				externalURL.searchParams.append(
					"external",
					["react", "react-dom"].join(","),
				);
				return fetch(externalURL.toString(), options);
			}
		},
	});
}
