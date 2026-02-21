import Image from "next/image"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { MenuIcon } from "lucide-react"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Image src="/logo.png" alt="logo" width={120} height={120} />
        <Button size="icon" variant="outline">
          <MenuIcon className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default Header
