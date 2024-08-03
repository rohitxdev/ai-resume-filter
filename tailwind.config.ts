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
			colors: {
				twine: {
					DEFAULT: "#CB995E",
					50: "#F8F1E9",
					100: "#F3E7D9",
					200: "#E9D4BB",
					300: "#DFC09C",
					400: "#D5AD7D",
					500: "#CB995E",
					600: "#B67E3B",
					700: "#8C602D",
					800: "#61431F",
					900: "#372612",
					950: "#22170B",
				},
			},
		},
	},
	plugins: [reactAriaPlugin()],
} satisfies Config;
