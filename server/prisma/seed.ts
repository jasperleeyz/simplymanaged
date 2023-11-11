import { PrismaClient, Prisma } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/utils/security";

const prisma = new PrismaClient();

const subscriptionModelData: Prisma.SubscriptionModelCreateInput[] = [
  {
    name: "BASIC (SMALL)",
    member_limit: 100000,
    price: 10.99,
    payment_cycle: "MONTHLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "BASIC (SMALL)",
    member_limit: 100000,
    price: 89.99,
    payment_cycle: "ANNUALLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "BASIC (BIG)",
    member_limit: 500000,
    price: 19.99,
    payment_cycle: "MONTHLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "BASIC (BIG)",
    member_limit: 500000,
    price: 159.99,
    payment_cycle: "ANNUALLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "PREMIUM (SMALL)",
    member_limit: 100000,
    price: 30.99,
    payment_cycle: "MONTHLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "PREMIUM (SMALL)",
    member_limit: 100000,
    price: 249.99,
    payment_cycle: "ANNUALLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "PREMIUM (BIG)",
    member_limit: 500000,
    price: 36.99,
    payment_cycle: "MONTHLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
  {
    name: "PREMIUM (BIG)",
    member_limit: 500000,
    price: 399.99,
    payment_cycle: "ANNUALLY",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  },
];

const codeTypeData: Prisma.CodeTypeCreateInput[] = [
  {
    code_type: "INDUSTRY",
    status: "A",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  },
  {
    code_type: "NO_OF_EMPLOYEES",
    status: "A",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  }
];

const companyData: Prisma.CompanyCreateInput[] = [
  {
    name: "SimplyManaged",
    uen: "T23LL1111N",
    email: "teamsimplymanaged@gmail.com",
    no_of_employees: 500000,
    industry: "IT",
    address: "Singapore",
    contact_no: 81234567,
    created_by: "SYSTEM",
    created_date: new Date(),
    updated_by: "SYSTEM",
    updated_date: new Date(),
    subscriptions: {
      create: {
        id: 1,
        type: "PREMIUM (BIG)",
        employee_quantity: 500000,
        price: 0,
        status: "A",
        payment_cycle: "PERMANENT",
        start_date: new Date(),
        end_date: new Date("9999-12-31"),
        created_by: "SYSTEM",
        updated_by: "SYSTEM",
        created_date: new Date(),
        updated_date: new Date(),
      },
    },
    employees: {
      create: {
        id: 0,
        email: "teamsimplymanaged@gmail.com",
        contact_no: 81234567,
        created_by: "SYSTEM",
        created_date: new Date(),
        fullname: "SimplyManaged Support Team",
        position: "Support",
        role: "SA",
        status: "A",
        updated_by: "SYSTEM",
        updated_date: new Date(),
        password: hashPassword(process.env.SA_PW || "password", generateSalt()),
      },
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  console.log(`Seeding SubscriptionModel data...`)
  for (const sm of subscriptionModelData) {
    const subModel = await prisma.subscriptionModel.create({
      data: sm,
    });
    console.log(`Created subscriptionModel with name: ${subModel.name}`);
  }
  console.log(`Completed seeding for SubscriptionModel data!`)

  console.log(`Seeding CodeType data...`)
  for (const ct of codeTypeData) {
    const codeType = await prisma.codeType.create({
      data: ct,
    });
    console.log(`Created codeType with name: ${codeType.code_type}`);
  }
  console.log(`Completed seeding for CodeType data!`)

  console.log(`Seeding Company data...`)
  for (const c of companyData) {
    const simplyManaged = await prisma.company.create({
      data: c,
      include: {
        employees: true,
      },
    });
    console.log(`Created SimplyManaged with new User ID: ${simplyManaged.employees[0].email}`);
  }
  console.log(`Completed seeding for Company data!`)
  
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
