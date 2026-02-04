import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
						ChoreShare
					</h1>
					<p className="text-slate-400 mt-2">Join your household</p>
				</div>
				<SignUp
					appearance={{
						elements: {
							rootBox: "mx-auto",
							card: "bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl",
							headerTitle: "text-white",
							headerSubtitle: "text-slate-400",
							socialButtonsBlockButton:
								"bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
							formFieldLabel: "text-slate-300",
							formFieldInput: "bg-slate-800 border-slate-700 text-white",
							footerActionLink: "text-indigo-400 hover:text-indigo-300",
						},
					}}
				/>
			</div>
		</div>
	);
}
