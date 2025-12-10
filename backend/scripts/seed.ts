import userDataFunctions from "../data/users.ts";
import wikiDataFunctions from "../data/wikis.ts";
import pageDataFunctions from "../data/pages.ts";
import { indexPage } from "../lib/search/indexer.ts";
import redisFunctions from "../lib/redis/redis.ts";
import { ensureIndex, esClient, WIKI_INDEX } from "../lib/search/search.ts";
import { databaseConnection } from "../config/mongoConnection.ts";
import { users, wikis } from "../config/mongoCollections.ts";

// Hard-coded Firebase UIDs of users already created in Firebase
const SEED_USER_UIDS = [
	"mffBHytp3td1WTLUUsagbxkd7GN2",
	"fMW5DoXA6CUEd5kKVJWRiWqt6p23",
	"e7CHvUC7xoOdY3Uz1pBHOo3qG7l1",
	"39ZJcRzqBzd3WQutJbFGmf1pE6g1",
	"0nEocWnabUPQW4bm9GMn8Yk3Jsr2",
	"3L6aRP6NhdPTOTnLkfFmclxHOqL2",
	"zje4GTOAGzQezhp7V9oUzGTrji43",
	"ttgWSeJfpFQ96B9GsEXFnAbCcJ13",
	"HSqikpgSicOk3K2UryuEkXFxX1K3",
	"iXpvdkmqTnZoOJC2BykznGS2nBB2"
];

interface SeedUser {
	uid: string;
	username: string;
	email: string;
}

const seedUsers: SeedUser[] = [
	{
		uid: SEED_USER_UIDS[0],
		username: "JohnDoe",
		email: "user1@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[1],
		username: "JaneSmith",
		email: "user2@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[2],
		username: "AlexJohnson",
		email: "user3@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[3],
		username: "EmilyBrown",
		email: "user4@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[4],
		username: "MichaelWilson",
		email: "user5@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[5],
		username: "SarahDavis",
		email: "user6@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[6],
		username: "DavidMiller",
		email: "user7@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[7],
		username: "OliviaGarcia",
		email: "user8@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[8],
		username: "JamesMartinez",
		email: "user9@gmail.com"
	},
	{
		uid: SEED_USER_UIDS[9],
		username: "SophiaAnderson",
		email: "user10@gmail.com"
	}
];

interface SeedWiki {
	name: string;
	description: string;
	urlName: string;
	ownerUid: string;
	access: string;
	pages: Array<{
		name: string;
		category: string;
		content: string[];
	}>;
}

const seedWikis: SeedWiki[] = [
	{
		name: "Web Development Guide",
		description: "A comprehensive guide to modern web development",
		urlName: "web-development-guide",
		ownerUid: SEED_USER_UIDS[0],
		access: "public-edit",
		pages: [
			{
				name: "Getting Started with React",
				category: "UNCATEGORIZED",
				content: [
					"# Getting Started with React\n\nReact is a JavaScript library for building user interfaces with reusable components.\n\n## Key Concepts\n\n- **Components**: Building blocks of React apps\n- **JSX**: JavaScript syntax extension\n- **Props**: Data passed to components\n- **State**: Component data that changes over time",
					"## Installation\n\n```bash\nnpx create-react-app my-app\ncd my-app\nnpm start\n```",
					"| Feature | Description |\n|---------|-------------|\n| Virtual DOM | Efficient rendering |\n| Component-based | Reusable UI pieces |\n| One-way data flow | Predictable state management |"
				]
			},
			{
				name: "Node.js Best Practices",
				category: "UNCATEGORIZED",
				content: [
					"# Node.js Best Practices\n\nNode.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.\n\n## Best Practices\n\n1. Use async/await for asynchronous code\n2. Handle errors properly\n3. Use environment variables\n4. Implement logging\n5. Use a process manager like PM2",
					"**Error Handling Example:**\n\n```javascript\ntry {\n  await someAsyncOperation();\n} catch (error) {\n  console.error('Error:', error);\n  // Handle error appropriately\n}\n```"
				]
			}
		]
	},
	{
		name: "Database Design Patterns",
		description:
			"Learn about database design patterns and optimization techniques",
		urlName: "database-design-patterns",
		ownerUid: SEED_USER_UIDS[1],
		access: "public-view",
		pages: [
			{
				name: "Relational Database Fundamentals",
				category: "UNCATEGORIZED",
				content: [
					"# Relational Database Fundamentals\n\nRelational databases organize data into tables with rows and columns.\n\n## ACID Properties\n\n- **Atomicity**: Transactions are all-or-nothing\n- **Consistency**: Data remains valid\n- **Isolation**: Concurrent transactions don't interfere\n- **Durability**: Committed data persists",
					"| Database | Type | Use Case |\n|----------|------|----------|\n| PostgreSQL | Relational | Complex queries, ACID compliance |\n| MySQL | Relational | Web applications |\n| SQLite | Relational | Embedded, mobile apps |"
				]
			},
			{
				name: "MongoDB Schema Design",
				category: "UNCATEGORIZED",
				content: [
					"# MongoDB Schema Design\n\nMongoDB is a document-oriented database with flexible schema design.\n\n## Design Patterns\n\n- **Embedding**: Store related data together\n- **Referencing**: Link documents with IDs\n- **Hybrid**: Combine both approaches",
					'**Example Document:**\n\n```json\n{\n  "_id": ObjectId("..."),\n  "name": "John Doe",\n  "email": "john@example.com",\n  "orders": [\n    { "id": 1, "total": 99.99 },\n    { "id": 2, "total": 149.99 }\n  ]\n}\n```',
					"*Remember*: Schema design should be driven by your application's query patterns!"
				]
			}
		]
	},
	{
		name: "Cloud Computing Essentials",
		description: "Understanding cloud infrastructure and deployment strategies",
		urlName: "cloud-computing-essentials",
		ownerUid: SEED_USER_UIDS[2],
		access: "public-edit",
		pages: [
			{
				name: "AWS Essentials",
				category: "UNCATEGORIZED",
				content: [
					"# AWS Essentials\n\nAmazon Web Services provides on-demand cloud computing resources.\n\n## Core Services\n\n- **EC2**: Virtual servers\n- **S3**: Object storage\n- **RDS**: Managed databases\n- **Lambda**: Serverless compute",
					"| Service | Purpose | Pricing Model |\n|---------|---------|---------------|\n| EC2 | Virtual Servers | Per hour/second |\n| S3 | Storage | Per GB stored |\n| Lambda | Serverless | Per invocation |\n| RDS | Databases | Per instance hour |"
				]
			},
			{
				name: "Docker Containers",
				category: "UNCATEGORIZED",
				content: [
					"# Docker Containers\n\nDocker enables you to package applications with their dependencies.\n\n## Benefits\n\n1. **Consistency**: Same environment everywhere\n2. **Isolation**: Apps don't interfere\n3. **Portability**: Run anywhere\n4. **Efficiency**: Lightweight compared to VMs",
					'**Basic Dockerfile:**\n\n```dockerfile\nFROM node:18\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n```',
					"*Pro tip*: Use `.dockerignore` to exclude unnecessary files!"
				]
			}
		]
	},
	{
		name: "Machine Learning Basics",
		description: "Introduction to machine learning concepts and algorithms",
		urlName: "machine-learning-basics",
		ownerUid: SEED_USER_UIDS[3],
		access: "private",
		pages: [
			{
				name: "Supervised Learning",
				category: "UNCATEGORIZED",
				content: [
					"# Supervised Learning\n\nSupervised learning uses labeled training data to make predictions.\n\n## Common Algorithms\n\n- Linear Regression\n- Logistic Regression\n- Decision Trees\n- Random Forests\n- Neural Networks",
					"| Algorithm | Type | Use Case |\n|-----------|------|----------|\n| Linear Regression | Regression | Continuous predictions |\n| Logistic Regression | Classification | Binary outcomes |\n| Random Forest | Both | General purpose |",
					"**Remember**: Always split your data into training and testing sets!"
				]
			}
		]
	},
	{
		name: "Python Programming",
		description: "Python programming tips, tricks, and best practices",
		urlName: "python-programming",
		ownerUid: SEED_USER_UIDS[4],
		access: "public-edit",
		pages: [
			{
				name: "Python Basics",
				category: "UNCATEGORIZED",
				content: [
					"# Python Basics\n\nPython is a versatile, high-level programming language.\n\n## Key Features\n\n- **Easy to learn**: Simple, readable syntax\n- **Versatile**: Web, data science, automation, AI\n- **Large ecosystem**: Extensive libraries\n- **Community**: Active and supportive",
					"```python\n# Hello World\nprint('Hello, World!')\n\n# Variables\nname = 'Alice'\nage = 30\n\n# Functions\ndef greet(person):\n    return f'Hello, {person}!'\n```"
				]
			},
			{
				name: "Data Structures",
				category: "UNCATEGORIZED",
				content: [
					"# Python Data Structures\n\n## Built-in Types\n\n- **Lists**: Ordered, mutable collections\n- **Tuples**: Ordered, immutable collections\n- **Dictionaries**: Key-value pairs\n- **Sets**: Unordered, unique elements",
					"| Type | Syntax | Mutable | Ordered |\n|------|--------|---------|----------|\n| List | `[1, 2, 3]` | Yes | Yes |\n| Tuple | `(1, 2, 3)` | No | Yes |\n| Dict | `{'a': 1}` | Yes | Yes (3.7+) |\n| Set | `{1, 2, 3}` | Yes | No |",
					"*Tip*: Use the right data structure for the job to optimize performance!"
				]
			}
		]
	},
	{
		name: "Company Internal Documentation",
		description: "Confidential company processes and procedures",
		urlName: "company-internal-docs",
		ownerUid: SEED_USER_UIDS[5],
		access: "private",
		pages: [
			{
				name: "Onboarding Process",
				category: "UNCATEGORIZED",
				content: [
					"# Employee Onboarding Process\n\n## Week 1\n\n- **Day 1**: HR orientation, IT setup\n- **Day 2-3**: Team introductions, codebase overview\n- **Day 4-5**: First small tasks, pair programming",
					"## Required Accounts\n\n| Service | Purpose | Request From |\n|---------|---------|-------------|\n| GitHub | Code repository | IT Admin |\n| Slack | Communication | HR |\n| AWS | Cloud access | DevOps Team |\n| Jira | Project management | Team Lead |",
					"*Important*: All new hires must complete security training by end of week 1!"
				]
			},
			{
				name: "Security Protocols",
				category: "UNCATEGORIZED",
				content: [
					"# Security Protocols\n\n## Access Control\n\n1. **VPN Required**: All remote access must use company VPN\n2. **2FA Mandatory**: Enable on all accounts\n3. **Password Policy**: Minimum 12 characters, rotated every 90 days\n4. **Device Encryption**: All company devices must be encrypted",
					"**Incident Response:**\n\nIf you suspect a security breach:\n1. Immediately notify security@company.com\n2. Document what you observed\n3. Do not share details with unauthorized personnel\n4. Await further instructions"
				]
			}
		]
	},
	{
		name: "Research Project Alpha",
		description: "Confidential research notes and findings",
		urlName: "research-project-alpha",
		ownerUid: SEED_USER_UIDS[6],
		access: "private",
		pages: [
			{
				name: "Experiment Results",
				category: "UNCATEGORIZED",
				content: [
					"# Experiment Results - Phase 1\n\n## Hypothesis\n\nIncreasing the cache hit ratio will reduce database load by 40%.\n\n## Methodology\n\n- **Test Duration**: 30 days\n- **Sample Size**: 10,000 requests/day\n- **Control Group**: Standard caching\n- **Test Group**: Enhanced caching strategy",
					"## Results\n\n| Metric | Control | Test | Improvement |\n|--------|---------|------|-------------|\n| DB Queries | 8,500/day | 4,200/day | 50.6% |\n| Response Time | 245ms | 128ms | 47.8% |\n| Cache Hit Rate | 62% | 89% | 27% points |",
					"**Conclusion**: The enhanced caching strategy exceeded our initial hypothesis. Recommend rollout to production."
				]
			},
			{
				name: "Next Steps",
				category: "UNCATEGORIZED",
				content: [
					"# Project Roadmap\n\n## Q1 2026\n\n- [ ] Complete Phase 2 testing\n- [ ] Security audit of caching layer\n- [ ] Performance benchmarking\n- [ ] Documentation for operations team",
					"## Team Members\n\n- **Lead**: DavidMiller\n- **Backend**: AlexJohnson, JamesMartinez\n- **Infrastructure**: SarahDavis\n- **QA**: EmilyBrown"
				]
			}
		]
	},
	{
		name: "Personal Finance Guide",
		description:
			"Private notes on investment strategies and financial planning",
		urlName: "personal-finance-guide",
		ownerUid: SEED_USER_UIDS[7],
		access: "private",
		pages: [
			{
				name: "Investment Strategy",
				category: "UNCATEGORIZED",
				content: [
					"# Investment Strategy 2025\n\n## Portfolio Allocation\n\n- **Stocks**: 60% (diversified across sectors)\n- **Bonds**: 25% (government and corporate)\n- **Real Estate**: 10% (REITs)\n- **Cash/Emergency Fund**: 5%",
					"## Monthly Contributions\n\n| Account | Amount | Purpose |\n|---------|--------|----------|\n| 401(k) | $1,500 | Retirement |\n| Roth IRA | $500 | Tax-free growth |\n| Brokerage | $800 | Long-term investing |\n| Savings | $300 | Emergency fund |",
					"*Note*: Rebalance quarterly to maintain target allocation."
				]
			},
			{
				name: "Tax Planning",
				category: "UNCATEGORIZED",
				content: [
					"# Tax Planning Checklist\n\n## Annual Tasks\n\n1. Max out tax-advantaged accounts\n2. Harvest tax losses before year-end\n3. Review estimated tax payments\n4. Track charitable donations\n5. Keep receipts for deductible expenses",
					"**Important Deadlines:**\n\n- April 15: Tax filing deadline\n- December 31: IRA contribution deadline for current year\n- January 15: Q4 estimated tax payment"
				]
			}
		]
	}
];

async function seedDatabase() {
	try {
		// Connect to MongoDB
		await databaseConnection();
		console.log("Connected to MongoDB");

		// Clear existing data
		console.log("\n--- Clearing Existing Data ---");
		const usersCollection = await users();
		const wikisCollection = await wikis();

		const deletedUsers = await usersCollection.deleteMany({});
		const deletedWikis = await wikisCollection.deleteMany({});

		console.log(`Deleted ${deletedUsers.deletedCount} users`);
		console.log(`Deleted ${deletedWikis.deletedCount} wikis`);

		// Clear Redis cache
		await redisFunctions.clear_all();

		// Delete and recreate Elasticsearch index
		console.log("\n--- Resetting Elasticsearch Index ---");
		try {
			await esClient.indices.delete({ index: WIKI_INDEX });
			console.log("Deleted existing Elasticsearch index");
		} catch (err: any) {
			if (err.statusCode === 404) {
				console.log("No existing index to delete");
			} else {
				throw err;
			}
		}

		await ensureIndex();
		console.log("Created fresh Elasticsearch index");

		console.log("\n--- Seeding Users ---");
		const createdUsers: SeedUser[] = [];

		for (const seedUser of seedUsers) {
			try {
				// Check if user already exists in backend
				let existingUser;
				try {
					existingUser = await userDataFunctions.getUserByFirebaseUID(
						seedUser.uid
					);
				} catch (e) {
					existingUser = null;
				}

				if (existingUser) {
					console.log(`User ${seedUser.username} already exists, skipping...`);
					createdUsers.push(seedUser);
				} else {
					// Create user in backend database
					await userDataFunctions.createUser(seedUser.email, seedUser.uid);
					// Update username
					await userDataFunctions.changeUsername(
						seedUser.uid,
						seedUser.username
					);
					console.log(`Created user: ${seedUser.username} (${seedUser.email})`);
					createdUsers.push(seedUser);
				}
			} catch (error) {
				console.error(`Error creating user ${seedUser.username}:`, error);
			}
		}

		console.log("\n--- Seeding Wikis and Pages ---");

		for (const seedWiki of seedWikis) {
			try {
				// Create wiki
				const newWiki = await wikiDataFunctions.createWiki(
					seedWiki.name,
					seedWiki.urlName,
					seedWiki.description,
					seedWiki.access,
					seedWiki.ownerUid
				);
				console.log(`Created wiki: ${seedWiki.name}`);

				// Create pages and index them
				for (const pageData of seedWiki.pages) {
					try {
						const newPage = await pageDataFunctions.createPage(
							newWiki._id.toString(),
							pageData.name,
							pageData.category
						);

						// Update page content
						await pageDataFunctions.changePageContent(
							newWiki._id.toString(),
							newPage.pages[newPage.pages.length - 1]._id.toString(),
							pageData.content
						);

						// Index page in Elasticsearch
						await indexPage(newWiki._id.toString(), {
							_id: newPage._id,
							name: pageData.name,
							category: pageData.category,
							content: pageData.content
						});

						console.log(`  Created and indexed page: ${pageData.name}`);
					} catch (error) {
						console.error(`  Error creating page ${pageData.name}:`, error);
					}
				}
			} catch (error) {
				console.error(`Error creating wiki ${seedWiki.name}:`, error);
			}
		}

		console.log("\n--- Seeding Complete ---");
		console.log(`Total users created: ${createdUsers.length}`);
		console.log(`Total wikis created: ${seedWikis.length}`);

		process.exit(0);
	} catch (error) {
		console.error("Fatal error during seeding:", error);
		process.exit(1);
	}
}

// Run the seed script
seedDatabase();
