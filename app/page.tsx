import Header from "@/app/_components/ui/header"
import { Input } from "@/app/_components/ui/input"
import { SearchIcon } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "./_components/ui/card"
import { Badge } from "./_components/ui/badge"
import { Avatar } from "./_components/ui/avatar"
import { AvatarImage } from "./_components/ui/avatar"
import { db } from "./_lib/prisma"
import BarbershopItems from "./_components/ui/barbershop-items"

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
          <Button className="gap-2" variant="secondary">
            <Image src="/cabelo.svg" alt="cabelo" width={16} height={16} />
            Cabelo
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image src="/barba.svg" alt="barba" width={16} height={16} />
            Barba
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image
              src="/acabamento.svg"
              alt="acabamento"
              width={16}
              height={16}
            />
            Visagismo
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image
              src="/acabamento.svg"
              alt="acabamento"
              width={16}
              height={16}
            />
            Depilação
          </Button>

          <Button className="gap-2" variant="secondary">
            <Image
              src="/acabamento.svg"
              alt="acabamento"
              width={16}
              height={16}
            />
            Limpeza de pele
          </Button>
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
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-0">
            <div className="flex flex-col gap-2 py-5 pl-5">
              {/* Div Esquerda */}
              <Badge className="w-fit">Confirmado</Badge>
              <h3 className="text-lg font-bold">Corte de Cabelo</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png" />
                </Avatar>
                <p className="text-sm">Barbearia do João</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-l-2 border-solid border-gray-200 px-5">
              {/* Div Direita */}
              <p className="text-sm">Fevereiro</p>
              <p className="text-2xl">06</p>
              <p className="text-sm">09:45</p>
            </div>
          </CardContent>
        </Card>

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
