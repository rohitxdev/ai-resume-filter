import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useParams } from "@remix-run/react";
import jwt from "jsonwebtoken";
import { useEffect, useRef } from "react";
import { Button, Heading } from "react-aria-components";
import { LuArrowLeft } from "react-icons/lu";
import { z } from "zod";

import { googleUserSchema } from "~/schemas/auth";
import { commitSession, destroySession, exchangeCodeForToken, exchangeTokenForUserInfo, getGoogleAuthUrl, getSession } from "~/utils/auth.server";

import Spinner from "~/assets/spinner.svg?react";
import { InputField } from "~/components/ui";
import { createUser, getUserByEmail, setUserPasswordResetToken } from "~/db/user.server";
import { config } from "~/utils/config.server";
import { useCommonLoader } from "~/utils/hooks";
import { getRandomNumber, scrypt } from "~/utils/misc";

const authTypeSchema = z.enum(["log-in", "sign-up", "forgot-password"]);

const logInBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const signUpBodySchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8, "Password has to be at least 8 characters long."),
		"confirm-password": z.string(),
	})
	.refine((val) => val.password === val["confirm-password"]);

const forgotPasswordBodySchema = z.object({
	email: z.string().email(),
});

export const action = async (args: ActionFunctionArgs) => {
	const session = await getSession();
	if (session.has("userId")) return json({ success: false, message: "user is already logged in" }, 400);

	const formData = Object.fromEntries(await args.request.formData());
	if (formData["bot-trap"]) return null;

	switch (args.params.type) {
		case "log-in": {
			const logInData = logInBodySchema.safeParse(formData);
			if (!logInData.success) return json(logInData.error, 422);

			const user = await getUserByEmail(logInData.data.email);
			if (!user) return json({ error: "user not found" }, 404);
			if (!user.passwordHash) return json({ error: "password not set" });

			if (!scrypt.verify(logInData.data.password, user.passwordHash)) {
				return json({ error: "incorrect password" }, 400);
			}

			session.set("userId", user.id.toString());

			return json(null, {
				headers: {
					"Set-Cookie": await commitSession(session),
				},
			});
		}

		case "sign-up": {
			const signUpData = signUpBodySchema.safeParse(formData);
			if (!signUpData.success) return json(signUpData.error, 422);

			if (await getUserByEmail(signUpData.data.email)) {
				return json({ error: "user with this email already exists" }, 400);
			}

			const userId = await createUser({
				email: signUpData.data.email,
				passwordHash: scrypt.hash(signUpData.data.password),
				pictureUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${getRandomNumber(9999, 99999)}`,
				role: "user",
				isBanned: false,
				creditsLeft: 5,
			});

			session.set("userId", userId);

			return json(null, {
				headers: {
					"Set-Cookie": await commitSession(session),
				},
			});
		}

		case "log-out":
			return redirect("/", {
				headers: {
					"Set-Cookie": await destroySession(session),
				},
			});

		case "forgot-password": {
			const forgotPasswordData = forgotPasswordBodySchema.safeParse(formData);
			if (!forgotPasswordData.success) return json(forgotPasswordData.error, 422);
			const user = await getUserByEmail(forgotPasswordData.data.email);
			if (!user) return json({ error: "user not found" }, 404);
			const passwordResetToken = jwt.sign(
				{
					sub: user.id,
					type: "password-reset",
				},
				config.JWT_SIGNING_KEY,
				{ expiresIn: "10m" },
			);
			setUserPasswordResetToken(user.id.toString(), passwordResetToken);
			return { message: "Sent reset password email", passwordResetToken };
		}

		default:
			return json({ error: "invalid auth type" }, 400);
	}
};

export const loader = async (args: LoaderFunctionArgs) => {
	const session = await getSession(args.request.headers.get("Cookie"));
	if (session.has("userId")) return redirect("/");

	const { searchParams, origin } = new URL(args.request.url);

	const authType = authTypeSchema.safeParse(args.params.type);
	if (!authType.success) return redirect("/auth/log-in");

	const code = searchParams.get("code");
	const redirectUri = `${origin}/auth/log-in`;

	if (!code)
		return {
			googleAuthUrl: getGoogleAuthUrl({
				clientId: config.GOOGLE_CLIENT_ID,
				redirectUri,
				responseType: "code",
				scope: "email profile",
				prompt: "consent",
				state: "google",
				accessType: "offline",
			}),
			gitHubAuthUrl: null,
			reload: false,
		};

	switch (searchParams.get("state")) {
		case "google": {
			const token = await exchangeCodeForToken(code, redirectUri);
			if (!token) return null;

			const userInfo = await exchangeTokenForUserInfo(token);

			if (!userInfo) return null;

			const googleUser = googleUserSchema.safeParse(userInfo);
			if (!googleUser.success) return null;

			const { email, name, picture } = googleUser.data;
			const user = await getUserByEmail(email);

			if (user?.id) {
				session.set("userId", user.id.toString());
			} else {
				const userId = await createUser({
					email,
					fullName: name,
					pictureUrl: picture,
					role: "user",
					isBanned: false,
					creditsLeft: 5,
				});
				session.set("userId", userId);
			}
			return json(
				{ googleAuthUrl: null, gitHubAuthUrl: null, reload: true },
				{
					headers: {
						"Set-Cookie": await commitSession(session),
					},
				},
			);
		}
		case "github": {
			return null;
		}
		default: {
			return null;
		}
	}
};

export default function Route() {
	const params = useParams();
	const authType = params.type as z.infer<typeof authTypeSchema>;
	const data = useLoaderData<typeof loader>();
	const googleAuthUrl = data?.googleAuthUrl;
	const gitHubAuthUrl = data?.gitHubAuthUrl;
	const passwordRef = useRef<string | null>(null);
	const { state } = useNavigation();
	const { user } = useCommonLoader();

	// biome-ignore lint/correctness/useExhaustiveDependencies: only need to check once
	useEffect(() => {
		if (data?.reload) {
			location.reload();
		}
	}, []);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-2">
			<Link
				to="/"
				className="absolute top-0 left-0 m-6 block size-12 rounded-full p-2 duration-200 ease-out hover:bg-white hover:text-black"
				aria-label="Go back"
			>
				<LuArrowLeft className="size-full" />
			</Link>
			{data?.reload ? (
				<Spinner className="mx-auto size-12 fill-black" />
			) : user ? (
				<>
					<h2 className="font-semibold text-2xl">You are already logged in.</h2>
				</>
			) : (
				<>
					<img src="/logo.png" alt="Logo" height={64} width={64} />
					<Form
						className="grid w-[calc(100vw-32px)] max-w-sm items-center gap-4 rounded-lg border border-white/10 bg-white/50 p-6 ring-white/30 [&_label]:text-black [&_label]:text-sm"
						method="POST"
						action={`/auth/${authType}`}
					>
						<Heading className="mb-2 text-center font-bold text-3xl">
							{authType === "log-in" ? "Welcome Back" : authType === "sign-up" ? "Create Account" : "Reset Password"}
						</Heading>
						<InputField type="email" name="email" autoComplete="email" label="Email" isRequired />
						{authType === "forgot-password" && (
							<Button
								type="submit"
								className="mt-2 h-12 w-full rounded-lg bg-twine-500 font-semibold text-lg"
								onPress={() => alert("Sent email!")}
							>
								Send Reset Email
							</Button>
						)}
						{authType !== "forgot-password" && (
							<InputField
								type="text"
								name="password"
								autoComplete="current-password"
								validate={(val) => {
									if (!val) return "Please enter your password.";
									if (authType === "log-in") return;
									if (val.length < 8) return "Password has to be at least 8 characters long.";
									return;
								}}
								minLength={8}
								onInput={(e) => {
									passwordRef.current = e.currentTarget.value;
								}}
								label={
									<span className="flex items-center justify-between">
										Password
										{authType === "log-in" && (
											<Link
												to="/auth/forgot-password"
												className="ml-auto text-neutral-400 text-xs hover:text-white hover:underline"
											>
												Forgot password?
											</Link>
										)}
									</span>
								}
								isRequired
							/>
						)}
						{authType === "sign-up" && (
							<>
								<InputField
									type="text"
									name="confirm-password"
									validate={(val) => {
										if (!val) return "Please confirm your password.";
										if (val !== passwordRef.current) return "Passwords have to match.";
									}}
									minLength={8}
									label="Confirm password"
									isRequired
								/>
								{/* {clientConfig.IS_CAPTCHA_ENABLED && (
									<>
										<div id="captcha" />
										<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" />
									</>
								)} */}
							</>
						)}
						{authType !== "forgot-password" && (
							<>
								<Button type="submit" className="mt-2 h-12 w-full rounded-lg bg-twine-500 font-semibold text-xl">
									{state === "submitting" ? (
										<Spinner className="mx-auto size-6 fill-white" />
									) : authType === "log-in" ? (
										"Log In"
									) : (
										"Sign Up"
									)}
								</Button>
								<p className="-mt-2 text-right text-neutral-400 text-xs">
									{authType === "log-in" ? "Don't have an account?" : "Already have an account?"}
									<Link
										replace
										to={`/auth/${authType === "log-in" ? "sign-up" : "log-in"}`}
										className="ml-1 font-semibold text-twine-400 underline-offset-4 hover:underline"
									>
										{authType === "log-in" ? "Sign up" : "Log in"}
									</Link>
								</p>
								{
									<>
										<div className="my-2 flex w-full items-center justify-center gap-4 px-2 text-neutral-400 text-sm [&>hr]:h-0.5 [&>hr]:grow [&>hr]:border-neutral-400">
											<hr />
											<span>OR</span>
											<hr />
										</div>
										{googleAuthUrl && (
											<Link
												to={googleAuthUrl}
												className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
											>
												Continue with Google
												<img src="/google.svg" alt="Google Logo" height={24} width={24} />
											</Link>
										)}
										{gitHubAuthUrl && (
											<Link
												to={gitHubAuthUrl}
												className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
											>
												Continue with GitHub
												<img src="/github.svg" alt="GitHub Logo" height={24} width={24} />
											</Link>
										)}
									</>
								}
							</>
						)}
						<input type="email" name="bot-trap" aria-hidden className="hidden" />
					</Form>
				</>
			)}
			{authType === "sign-up" && (
				<small className="mt-2 px-8 text-center text-neutral-400 text-xs *:text-white">
					By signing up, you agree to our&nbsp;
					<Link className="underline" to="/terms-of-service">
						Terms of Service
					</Link>
					&nbsp;and&nbsp;
					<Link className="underline" to="/privacy-policy">
						Privacy Policy
					</Link>
					.
				</small>
			)}
		</div>
	);
}
