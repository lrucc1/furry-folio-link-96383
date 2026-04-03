import Foundation
import Combine

final class AppEnvironment: ObservableObject {
    let persistence: PersistenceController
    let syncMonitor: CloudKitSyncMonitor

    @Published var hasCompletedOnboarding: Bool = false
    @Published var isSignedInWithApple: Bool = false
    @Published var currentAppleUserID: String?

    init(persistence: PersistenceController = .shared) {
        self.persistence = persistence
        self.syncMonitor = CloudKitSyncMonitor(container: persistence.container)
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
    }

    func handleAppleSignIn(userID: String) {
        isSignedInWithApple = true
        currentAppleUserID = userID
    }
}
