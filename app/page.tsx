import Header from "@/app/_components/ui/header"
import { Input } from "@/app/_components/ui/input"
import { SearchIcon } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "./_components/ui/card"
import BoockingItems from "./_components/ui/boocking-items"
import { db } from "./_lib/prisma"
import BarbershopItems from "./_components/ui/barbershop-items"
import { quickSearch } from "./_constants/search"

/* TODO: Receber agendamento como prop para o componente BoockingItems */

const Home = async () => {
  const barbershops = await db.barbershop.findMany({})
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  })
  return (
    <div>
      <Header />

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título */}
        <h2 className="mt-10 text-center text-xl font-bold">Olá, Eduardo!</h2>
        <p className="mt-2 text-center text-sm">
          Segunda Feira, 21 de Fevereiro
        </p>
        {/* Input de Pesquisa */}
        <div className="item-center mt-6 flex gap-2">
          <Input placeholder="Pesquisar" className="w-full max-w-md" />
          <Button>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Busca rápida */}
        <div className="mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearch.map((item) => (
            <Button key={item.title} className="gap-2" variant="secondary">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={16}
                height={16}
              />
              {item.title}
            </Button>
          ))}
        </div>

        {/* Banner */}
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            src="/banner-01.png"
            alt="agende nos melhores com sfw barber"
            fill
            className="rounded-xl object-cover"
          />
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Agendamentos
        </h2>

        {/* Card de Agendamento */}
        <BoockingItems />

        {/* Cards de Barbeiros */}
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItems key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        {/* Barbearias populares */}
        {/* Cards de Barbeiros */}
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Populares
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map((barbershop) => (
            <BarbershopItems key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        {/* Footer*/}
      </div>
      <footer>
        <Card>
          <CardContent className="px-5 py-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-sm text-gray-400">
                @ 2026 - Desenvolvido por{" "}
                <span className="font-bold">Eduardo Torres </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  )
}

export default Home
