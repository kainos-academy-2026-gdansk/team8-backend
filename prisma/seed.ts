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

const statusNames = ["OPEN", "CLOSED"];

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
	{ roleName: "Lead Software Engineer", capability: "Software Engineering" },
	{
		roleName: "Principal Software Engineer",
		capability: "Software Engineering",
	},
	{ roleName: "Full Stack Engineer", capability: "Software Engineering" },
	{ roleName: "Backend Engineer", capability: "Software Engineering" },
	{ roleName: "Cloud Engineer", capability: "Cloud" },
	{ roleName: "Senior Cloud Engineer", capability: "Cloud" },
	{ roleName: "Cloud Consultant", capability: "Cloud" },
	{ roleName: "Cloud Platform Consultant", capability: "Cloud" },
	{ roleName: "DevOps Engineer", capability: "DevOps" },
	{ roleName: "Senior DevOps Engineer", capability: "DevOps" },
	{ roleName: "Site Reliability Engineer", capability: "DevOps" },
	{ roleName: "DevSecOps Engineer", capability: "DevOps" },
	{ roleName: "Platform Engineer", capability: "Platform Engineering" },
	{
		roleName: "Senior Platform Engineer",
		capability: "Platform Engineering",
	},
	{
		roleName: "Kubernetes Platform Engineer",
		capability: "Platform Engineering",
	},
	{ roleName: "Test Engineer", capability: "Quality Engineering" },
	{ roleName: "Senior Test Engineer", capability: "Quality Engineering" },
	{
		roleName: "Automation Test Engineer",
		capability: "Quality Engineering",
	},
	{ roleName: "QA Consultant", capability: "Quality Engineering" },
	{ roleName: "Data Engineer", capability: "Data & Analytics" },
	{ roleName: "Senior Data Engineer", capability: "Data & Analytics" },
	{ roleName: "Analytics Engineer", capability: "Data & Analytics" },
	{ roleName: "Data Analytics Consultant", capability: "Data & Analytics" },
	{
		roleName: "Machine Learning Engineer",
		capability: "Artificial Intelligence & Machine Learning",
	},
	{
		roleName: "Senior Machine Learning Engineer",
		capability: "Artificial Intelligence & Machine Learning",
	},
	{
		roleName: "MLOps Engineer",
		capability: "Artificial Intelligence & Machine Learning",
	},
	{ roleName: "Experience Designer", capability: "Experience Design" },
	{
		roleName: "Senior Experience Designer",
		capability: "Experience Design",
	},
	{ roleName: "UX Researcher", capability: "Experience Design" },
	{ roleName: "Product Manager", capability: "Product Management" },
	{ roleName: "Senior Product Manager", capability: "Product Management" },
	{
		roleName: "Technical Product Manager",
		capability: "Product Management",
	},
	{ roleName: "Business Analyst", capability: "Business Analysis" },
	{
		roleName: "Senior Business Analyst",
		capability: "Business Analysis",
	},
	{ roleName: "Lead Business Analyst", capability: "Business Analysis" },
	{ roleName: "Cyber Security Consultant", capability: "Cyber Security" },
	{
		roleName: "Senior Cyber Security Consultant",
		capability: "Cyber Security",
	},
	{ roleName: "Security Engineer", capability: "Cyber Security" },
	{ roleName: "IAM Consultant", capability: "Cyber Security" },
	{ roleName: "Workday Consultant", capability: "Workday" },
	{ roleName: "Senior Workday Consultant", capability: "Workday" },
	{
		roleName: "Workday Integration Consultant",
		capability: "Workday",
	},
	{ roleName: "Solution Architect", capability: "Solution Architecture" },
	{
		roleName: "Senior Solution Architect",
		capability: "Solution Architecture",
	},
	{
		roleName: "Enterprise Solution Architect",
		capability: "Solution Architecture",
	},
	{
		roleName: "Cloud Solution Architect",
		capability: "Solution Architecture",
	},
	{
		roleName: "Principal Solution Architect",
		capability: "Solution Architecture",
	},
	{ roleName: "Technical Architect", capability: "Solution Architecture" },
];

function buildDescription(roleName: string): string {
	return `${roleName} role supporting delivery across client and internal initiatives.`;
}

function buildResponsibilities(roleName: string): string {
	return `Design, implement, and maintain solutions as a ${roleName}; collaborate with cross-functional teams and uphold engineering standards.`;
}

function buildSharepointUrl(roleName: string): string {
	const slug = roleName.toLowerCase().replace(/\s+/g, "-");
	return `https://company.sharepoint.com/sites/job-specs/${slug}`;
}

async function main() {
	await prisma.jobRole.deleteMany();
	await prisma.status.deleteMany();
	await prisma.capability.deleteMany();
	await prisma.band.deleteMany();

	await prisma.capability.createMany({
		data: capabilityNames.map((name) => ({ name })),
	});

	await prisma.band.createMany({
		data: bandNames.map((name) => ({ name })),
	});

	await prisma.status.createMany({
		data: statusNames.map((name) => ({ name })),
	});

	const [capabilities, bands, statuses] = await Promise.all([
		prisma.capability.findMany(),
		prisma.band.findMany(),
		prisma.status.findMany(),
	]);

	const capabilityByName = new Map(
		capabilities.map((item) => [item.name, item]),
	);
	const statusByName = new Map(statuses.map((item) => [item.name, item]));
	const now = new Date();

	await prisma.jobRole.createMany({
		data: jobRoleSeeds.map((seed, index) => {
			const capability = capabilityByName.get(seed.capability);
			if (!capability) {
				throw new Error(`Missing capability for role: ${seed.roleName}`);
			}

			const statusName = index % 2 === 0 ? "OPEN" : "CLOSED";
			const status = statusByName.get(statusName);
			if (!status) {
				throw new Error(`Missing status: ${statusName}`);
			}

			return {
				roleName: seed.roleName,
				description: buildDescription(seed.roleName),
				responsibilities: buildResponsibilities(seed.roleName),
				sharepointUrl: buildSharepointUrl(seed.roleName),
				location: locations[index % locations.length],
				capabilityId: capability.id,
				bandId: bands[index % bands.length].id,
				closingDate: new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate() + index + 7,
				),
				statusId: status.id,
				numberOfOpenPositions: (index % 3) + 1,
			};
		}),
	});

	const [capabilityCount, bandCount, statusCount, jobRoleCount] =
		await Promise.all([
			prisma.capability.count(),
			prisma.band.count(),
			prisma.status.count(),
			prisma.jobRole.count(),
		]);

	console.log(
		`Seed complete: ${capabilityCount} capabilities, ${bandCount} bands, ${statusCount} statuses, ${jobRoleCount} job roles.`,
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
