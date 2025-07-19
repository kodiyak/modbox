import { Modpack } from "@modpack/core";
import { type PropsWithChildren, useEffect, useRef } from "react";

export default function ModpackProvider({ children }: PropsWithChildren) {
	const initialized = useRef(false);

	const onLoad = async () => {
		await Modpack.init({});
	};

	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			onLoad();
		}
	}, []);
	return <>{children}</>;
}
