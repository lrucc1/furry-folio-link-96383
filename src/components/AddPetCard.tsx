import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AddPetCard = () => {
  return (
    <Link to="/pets/new" className="block h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-lg border-dashed border-2 border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer group touch-manipulation">
        <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[280px] sm:min-h-[320px] md:min-h-[400px]">
          <div className="rounded-full bg-muted p-4 sm:p-6 mb-3 sm:mb-4 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            Add New Pet
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2 text-center">
            Click to add another family member
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
