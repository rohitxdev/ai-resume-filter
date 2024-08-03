import type { Config } from "tailwindcss";
import reactAriaPlugin from "tailwindcss-react-aria-components";

export default {
	content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				epilogue: ["Epilogue", "sans-serif"],
				chivo: ["Chivo", "sans-serif"],
			},
		},
	},
	plugins: [reactAriaPlugin()],
} satisfies Config;
