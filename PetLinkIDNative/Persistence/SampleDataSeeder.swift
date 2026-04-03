import CoreData

enum SampleDataSeeder {
    static func seedIfNeeded(in context: NSManagedObjectContext) {
        let request = NSFetchRequest<Pet>(entityName: "Pet")
        request.fetchLimit = 1

        let count = (try? context.count(for: request)) ?? 0
        guard count == 0 else { return }

        let pet = Pet(context: context)
        pet.id = UUID()
        pet.name = "Milo"
        pet.species = "Dog"
        pet.breed = "Cavoodle"
        pet.microchipNumber = "985170001234567"
        pet.isDesexed = true
        pet.notes = "Friendly and food motivated."
        pet.ownerInternalNotes = "Needs calm introductions around new dogs."
        pet.isShared = false
        pet.sharePermissionRaw = 1
        pet.createdAt = Date()
        pet.updatedAt = Date()

        let reminder = Reminder(context: context)
        reminder.id = UUID()
        reminder.title = "Annual vaccination"
        reminder.type = "vaccination_due"
        reminder.dueDate = Calendar.current.date(byAdding: .day, value: 14, to: Date())
        reminder.isCompleted = false
        reminder.createdAt = Date()
        reminder.updatedAt = Date()
        reminder.pet = pet

        do {
            try context.save()
        } catch {
            AppLogger.persistence.error("Failed preview seed: \(error.localizedDescription, privacy: .public)")
        }
    }
}
