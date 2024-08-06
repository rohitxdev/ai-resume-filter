import { Body, Container, Font, Head, Heading, Html, Preview, Tailwind, Text } from "@react-email/components";
import { Section } from "react-aria-components";
import reactAriaPlugin from "tailwindcss-react-aria-components";

interface SignUpVerifyEmailProps {
	code: string;
}

export const SignUpVerifyEmail = ({ code }: SignUpVerifyEmailProps) => {
	return (
		<Html>
			<Head>
				<Font
					fontFamily="Epilogue"
					fallbackFontFamily="sans-serif"
					webFont={{
						url: "https://fonts.gstatic.com/s/epilogue/v17/O4ZXFGj5hxF0EhjimlIhggQykkuewkOv-Q.woff2",
						format: "woff2",
					}}
					fontWeight={400}
					fontStyle="normal"
				/>
			</Head>
			<Preview>A fine-grained personal access token has been added to your account</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
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
				}}
			>
				<Body>
					<Container className="mx-auto rounded bg-twine-50 px-6 shadow-xl">
						<Heading>Sign up verification code</Heading>
						<Section>
							<Text className="text-black">This is your verification code:</Text>
							<Container>
								<Text className="w-fit rounded bg-black/10 p-2 font-bold text-3xl text-black">{code}</Text>
							</Container>
							<Text>It is valid for 10 minutes.</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

SignUpVerifyEmail.PreviewProps = {};

export default SignUpVerifyEmail;
