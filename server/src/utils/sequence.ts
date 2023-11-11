import { PrismaClient } from "@prisma/client";
import { SEQUENCE_KEYS } from "./constants";

const prisma = new PrismaClient();

export const getNextSequenceValue = async (
  company_id: number,
  sequenceName: string
) => {
  const results = await prisma.$transaction([
    prisma.sequences.findFirst({
      where: {
        company_id: company_id,
        sequence_key: sequenceName,
      },
    }),
    prisma.sequences.update({
      where: {
        company_id_sequence_key: {
          company_id: company_id,
          sequence_key: sequenceName,
        },
      },
      data: {
        sequence_value: {
          increment: 1,
        },
      },
    }),
  ]);

  return results[0]?.sequence_value || 1;
};

export const instantiateSequences = async (company_id: number) => {
  for (const [key, val] of Object.entries(SEQUENCE_KEYS)) {
    const sequence = await prisma.sequences.findFirst({
      where: {
        company_id: company_id,
        sequence_key: key,
      },
    });

    if (!sequence) {
      await prisma.sequences.create({
        data: {
          company_id: company_id,
          sequence_key: val,
          sequence_value: 1,
        },
      });
    }
  }
};
