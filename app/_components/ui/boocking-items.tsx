import { Avatar } from "@radix-ui/react-avatar"
import { Card } from "./card"
import { CardContent } from "./card"
import { AvatarImage } from "@radix-ui/react-avatar"
import { Badge } from "./badge"

const BoockingItems = () => {
  return (
    <>
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
    </>
  )
}

export default BoockingItems
