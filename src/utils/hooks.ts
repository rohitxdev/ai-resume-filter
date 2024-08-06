import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "~/root";

export const useCommonLoader = () => useRouteLoaderData<typeof rootLoader>("root")!;
