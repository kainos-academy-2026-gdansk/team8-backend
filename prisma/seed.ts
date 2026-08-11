import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is required to run the seed script.");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const capabilityNames = [
	"Software Engineering",
	"Cloud",
	"DevOps",
	"Platform Engineering",
	"Quality Engineering",
	"Data & Analytics",
	"Artificial Intelligence & Machine Learning",
	"Experience Design",
	"Product Management",
	"Business Analysis",
	"Cyber Security",
	"Workday",
	"Solution Architecture",
];

const bandNames = [
	"Trainee",
	"Associate",
	"Senior Associate",
	"Consultant",
	"Senior Consultant",
	"Principal",
	"Manager",
	"Senior Manager",
	"Capability Lead",
	"Director",
];

const locations = [
	"Belfast",
	"London",
	"Birmingham",
	"Derry/Londonderry",
	"Gdansk",
	"Dublin",
	"Amsterdam",
	"Copenhagen",
	"Toronto",
	"Indianapolis",
	"Remote",
];

const jobRoleSeeds = [
	{ roleName: "Software Engineer", capability: "Software Engineering" },
	{ roleName: "Senior Software Engineer", capability: "Software Engineering" },
	{ roleName: "Cloud Engineer", capability: "Cloud" },
	{ roleName: "DevOps Engineer", capability: "DevOps" },
	{ roleName: "Platform Engineer", capability: "Platform Engineering" },
	{ roleName: "Test Engineer", capability: "Quality Engineering" },
	{ roleName: "Data Engineer", capability: "Data & Analytics" },
	{
		roleName: "Machine Learning Engineer",
		capability: "Artificial Intelligence & Machine Learning",
	},
	{ roleName: "Experience Designer", capability: "Experience Design" },
	{ roleName: "Product Manager", capability: "Product Management" },
	{ roleName: "Business Analyst", capability: "Business Analysis" },
	{ roleName: "Cyber Security Consultant", capability: "Cyber Security" },
	{ roleName: "Workday Consultant", capability: "Workday" },
	{ roleName: "Solution Architect", capability: "Solution Architecture" },
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
		throw new Error(
			"Expected at least 10 capabilities and 10 bands after seed insert.",
		);
	}

	const capabilityByName = new Map(capabilities.map((c) => [c.name, c]));
	const now = new Date();

	await prisma.jobRole.createMany({
		data: jobRoleSeeds.map((role, index) => {
			const capability = capabilityByName.get(role.capability);
			if (!capability) {
				throw new Error(`Missing capability for role: ${role.roleName}`);
			}
			return {
				roleName: role.roleName,
				location: locations[index % locations.length],
				capabilityId: capability.id,
				bandId: bands[index % bands.length].id,
				closingDate: new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate() + index + 7,
				),
				status: index % 2 === 0 ? "OPEN" : "CLOSED",
			};
		}),
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
