export type StoredUser = { fullName: string; role: string };

export function getStoredUser(): StoredUser | null {
	try {
		const raw = localStorage.getItem("user");
		return raw ? (JSON.parse(raw) as StoredUser) : null;
	} catch {
		return null;
	}
}

export function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");
}

// "ADMIN" -> "Admin", "ON_LEAVE" -> "On leave"
export function formatRole(role: string) {
	const s = role.toLowerCase().replace(/_/g, " ");
	return s.charAt(0).toUpperCase() + s.slice(1);
}
