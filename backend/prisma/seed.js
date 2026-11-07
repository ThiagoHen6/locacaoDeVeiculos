import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

const veiculos = [
  { marca: "Fiat", modelo: "Argo", placa: "ABC1D23", ano: 2022, valorDiaria: 150 },
  { marca: "Chevrolet", modelo: "Onix", placa: "DEF4G56", ano: 2023, valorDiaria: 160 },
  { marca: "Volkswagen", modelo: "T-Cross", placa: "HIJ7K89", ano: 2023, valorDiaria: 240 },
  { marca: "Toyota", modelo: "Corolla", placa: "LMN0P12", ano: 2021, valorDiaria: 280 },
  { marca: "Hyundai", modelo: "HB20", placa: "QRS3T45", ano: 2022, valorDiaria: 140 },
];

for (const veiculo of veiculos) {
  await prisma.veiculo.upsert({
    where: { placa: veiculo.placa },
    update: {},
    create: veiculo,
  });
}

await prisma.$disconnect();
