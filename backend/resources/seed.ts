import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const achievements: any[] = [
	{
		id: 1,
		name: "Noob",
		description: "You finished your first match",
		logo: "/icons/noob.png"
	},
	{
		id: 2,
		name: "Bring the popcorn!",
		description: "You watched a match until the end",
		logo: "/icons/popcorn.png"
	},
	{
		id: 3,
		name: "Top of the ladder",
		description: "You climbed your way to the top of the ladder (or you won the first match recorded on the database)",
		logo: "/icons/trophy.png"
	},
	{
		id: 4,
		name: "Edward Snowden",
		description: "You took the time and effort of scanning a QR code in the name of security, chapeau",
		logo: "/icons/hacker.png"
	}
]

async function main() {
	achievements.forEach( async (value: {id: number, name: string, description: string, logo: string}, i: number) => {
		await prisma.achieve.upsert({
			where: { id: i + 1 },
			update: {},
			create: {
				id: value.id,
				name: value.name,
				description: value.description,
				logo: value.logo
			}
		})
	})
}

main()
.then(async () => {
	await prisma.$disconnect()
})
.catch(async (e) => {
	console.error(e);
	await prisma.$disconnect();
	process.exit(1);
})