import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AddPetCard = () => {
  return (
    <Link to="/pets/new" className="block h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-dashed border-2 border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer group">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="rounded-full bg-muted p-6 mb-4 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            Add New Pet
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-2 text-center">
            Click to add another family member
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
