import Foundation
import CoreData
import Combine

final class CloudKitSyncMonitor: ObservableObject {
    @Published private(set) var statusText: String = "Unknown"
    @Published private(set) var lastErrorMessage: String?

    private var observers: [NSObjectProtocol] = []

    init(container: NSPersistentCloudKitContainer) {
        statusText = "Configured"

        let center = NotificationCenter.default

        observers.append(
            center.addObserver(
                forName: NSPersistentStoreRemoteChangeNotification,
                object: container.persistentStoreCoordinator,
                queue: .main
            ) { [weak self] _ in
                self?.statusText = "Synced recently"
                self?.lastErrorMessage = nil
                AppLogger.sync.log("Received persistent store remote change")
            }
        )

        observers.append(
            center.addObserver(
                forName: .NSPersistentCloudKitContainerEventChanged,
                object: container,
                queue: .main
            ) { [weak self] note in
                self?.handleCloudKitEvent(note)
            }
        )
    }

    deinit {
        let center = NotificationCenter.default
        observers.forEach(center.removeObserver)
    }

    private func handleCloudKitEvent(_ notification: Notification) {
        guard
            let event = notification.userInfo?[NSPersistentCloudKitContainer.eventNotificationUserInfoKey]
                as? NSPersistentCloudKitContainer.Event
        else {
            return
        }

        if let error = event.error {
            statusText = "Sync Issue"
            lastErrorMessage = error.localizedDescription
            AppLogger.sync.error("CloudKit event error: \(error.localizedDescription, privacy: .public)")
            return
        }

        switch event.type {
        case .setup:
            statusText = "Setting up iCloud"
        case .import:
            statusText = "Import complete"
        case .export:
            statusText = "Export complete"
        @unknown default:
            statusText = "Sync updated"
        }
    }
}
