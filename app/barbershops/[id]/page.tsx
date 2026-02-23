import { Button } from "@/app/_components/ui/button"
import { db } from "@/app/_lib/prisma"
import { ChevronLeftIcon, MenuIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

interface BarbershopPageProps {
  params: Promise<{ id: string }>
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const { id } = await params
  const barbershop = await db.barbershop.findUnique({
    where: {
      id,
    },
  })

  if (!barbershop) notFound()

  return (
    <div>
      {/* Imagem */}
      <div className="relative h-[250px] w-full">
        <Image
          src={barbershop.imageURL}
          alt={barbershop.name}
          fill
          className="object-cover"
        />

        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-4"
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-4"
        >
          <MenuIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default BarbershopPage
