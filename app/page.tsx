import Header from "@/app/_components/ui/header"
import { Input } from "@/app/_components/ui/input"
import { SearchIcon } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import Image from "next/image"

const Home = () => {
  return (
    <div>
      <Header />
      <div className="p-5">
        <h2 className="mt-10 text-center text-xl font-bold">Olá, Eduardo!</h2>
        <p className="mt-2 text-center text-sm">
          Segunda Feira, 21 de Fevereiro
        </p>

        <div className="item-center mt-6 flex gap-2">
          <Input placeholder="Pesquisar" className="w-full max-w-md" />
          <Button>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            src="/banner-01.png"
            alt="agende nos melhores com sfw barber"
            fill
            className="rounded-xl object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Home
