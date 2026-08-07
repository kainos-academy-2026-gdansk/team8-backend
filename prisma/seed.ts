import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const capabilityNames = [
	"Java",
	"TypeScript",
	"Python",
	"Go",
	"SQL",
	"AWS",
	"Azure",
	"Docker",
	"Kubernetes",
	"React",
];

const bandNames = [
	"Associate",
	"Consultant",
	"Senior Consultant",
	"Lead Consultant",
	"Principal",
	"Architect",
	"Manager",
	"Senior Manager",
	"Director",
	"Partner",
];

async function main() {
	await prisma.jobRole.deleteMany();
	await prisma.capability.deleteMany();
	await prisma.band.deleteMany();

	await prisma.capability.createMany({
		data: capabilityNames.map((name) => ({ name })),
	});

	await prisma.band.createMany({
		data: bandNames.map((name) => ({ name })),
	});

	const capabilities = await prisma.capability.findMany();
	const bands = await prisma.band.findMany();

	if (capabilities.length < 10 || bands.length < 10) {
		throw new Error("Expected at least 10 capabilities and 10 bands after seed insert.");
	}

	const now = new Date();

	await prisma.jobRole.createMany({
		data: Array.from({ length: 10 }, (_, index) => ({
			roleName: `Engineer ${index + 1}`,
			location:
				index % 4 === 0
					? "Gdansk"
					: index % 4 === 1
						? "Warsaw"
						: index % 4 === 2
							? "Krakow"
							: "Remote",
			capabilityId: capabilities[index % capabilities.length].id,
			bandId: bands[index % bands.length].id,
			closingDate: new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + index + 7,
			),
			status: index % 2 === 0 ? "OPEN" : "CLOSED",
		})),
	});

	const [capabilityCount, bandCount, jobRoleCount] = await Promise.all([
		prisma.capability.count(),
		prisma.band.count(),
		prisma.jobRole.count(),
	]);

	console.log(
		`Seed complete: ${capabilityCount} capabilities, ${bandCount} bands, ${jobRoleCount} job roles.`,
	);
}

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
