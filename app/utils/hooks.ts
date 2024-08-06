import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "app/root";

export const useCommonLoader = () => useRouteLoaderData<typeof rootLoader>("root")!;
