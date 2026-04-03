import CoreData
import CloudKit

final class PersistenceController {
    static let shared = PersistenceController()

    static var preview: PersistenceController = {
        let controller = PersistenceController(inMemory: true)
        SampleDataSeeder.seedIfNeeded(in: controller.viewContext)
        return controller
    }()

    let container: NSPersistentCloudKitContainer

    var viewContext: NSManagedObjectContext {
        container.viewContext
    }

    init(inMemory: Bool = false) {
        let model = CoreDataModelBuilder.makeModel()
        container = NSPersistentCloudKitContainer(name: "PetLinkIDModel", managedObjectModel: model)

        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("Unable to create persistent store description")
        }

        if inMemory {
            description.url = URL(fileURLWithPath: "/dev/null")
        } else {
            description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(containerIdentifier: "iCloud.com.petlinkid.app")
            description.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
            description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        }

        description.type = NSSQLiteStoreType

        container.loadPersistentStores { _, error in
            if let error {
                AppLogger.persistence.fault("Failed loading persistent store: \(error.localizedDescription, privacy: .public)")
                fatalError("Unresolved persistence error: \(error)")
            }
        }

        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        container.viewContext.transactionAuthor = "app"
    }

    func save(context: NSManagedObjectContext? = nil) {
        let context = context ?? viewContext
        guard context.hasChanges else { return }

        do {
            try context.save()
        } catch {
            AppLogger.persistence.error("Save failure: \(error.localizedDescription, privacy: .public)")
        }
    }
}
