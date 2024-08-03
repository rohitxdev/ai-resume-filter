import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "~/root";

export const useRootLoader = () =>
	useRouteLoaderData<typeof rootLoader>("root")!;
