import { Barbershop } from "@/src/generated/prisma/client"
import { Card, CardContent } from "@/app/_components/ui/card"
import Image from "next/image"
import { Button } from "./button"
import { Badge } from "./badge"
import { StarIcon } from "lucide-react"

interface BarbershopItemsProps {
  barbershop: Barbershop
}

const BarbershopItems = ({ barbershop }: BarbershopItemsProps) => {
  return (
    <Card className="rounded-2-xl min-w-[167px]">
      <CardContent className="p-0 px-1 pt-1">
        {/* Imagem */}
        <div className="relative h-[159px] w-full">
          <Image
            src={barbershop.imageURL}
            alt={barbershop.name}
            fill
            className="rounded-2xl object-cover"
          />
          <Badge
            className="absolute left-2 top-2 space-x-1"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-primary text-primary" />
            <p>5.0</p>
          </Badge>
        </div>
        {/* Texto */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{barbershop.name}</h3>
          <p className="truncate text-sm text-gray-400">{barbershop.address}</p>
          <Button variant="secondary" className="mt-3 w-full">
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItems
