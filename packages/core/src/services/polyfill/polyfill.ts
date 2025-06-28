import { z } from "zod";
import { EventEmitter } from "../../shared/event-emitter";
import type { FetcherHook, ResolverHook } from "./types";

expor

ass PolyfillModules {
	privat
readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	priv

readonly fetcher: FetcherHook;

	private readonly resolver: ResolverHook;



	constructor(fetcher: Fet
		this.fetcher = fetcher;

		this.resolver = resolver;
	}




	private getEsmsInitOptions() {
		return {

			sh
Mode: true,
			h
Reload: true,

			hotReloadInterval: 500
		polyfillEnable: true,
	
mapOverrides: true,

			resolve: this.resolver,

	fetch: this.fetcher,
		};
	}


	
yn

/**
		 * @
do


		 * Set up the es-module
hims polyfill.
		 * Set up event emitter.
		 */
	}
}




