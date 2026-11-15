import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck2 } from "lucide-react";

export default function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			const session = await login({ email, password });
			navigate(session.role === "EMPLOYEE" ? "/my-attendance" : "/attendance", {
				replace: true,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
			<Card className="relative mx-auto w-full max-w-sm pt-0">
        <div className="relative">
          <div className="absolute inset-0 z-30 aspect-video bg-primary" />
          <img
            src="https://avatar.vercel.sh/shadcn1"
            alt="Event cover"
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
          />

          {/* Signature */}
          <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2 text-white">
            <CalendarCheck2 className="size-14" strokeWidth={1.75} />
            <span className="text-6xl font-semibold tracking-tight">Mono.</span>
          </div>
        </div>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form id="login-form" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="m@example.com"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									type="password"
									autoComplete="current-password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
								/>
							</div>
							{error ? (
								<p role="alert" className="text-sm text-destructive">
									{error}
								</p>
							) : null}
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button
						type="submit"
						form="login-form"
						className="w-full"
						disabled={loading}
					>
						{loading ? "Signing in…" : "Login"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
