import Foundation

final class RootViewModel: ObservableObject {
    enum Route {
        case onboarding
        case signIn
        case app
    }

    @Published private(set) var route: Route = .onboarding

    func refreshRoute(environment: AppEnvironment) {
        if !environment.hasCompletedOnboarding {
            route = .onboarding
        } else if !environment.isSignedInWithApple {
            route = .signIn
        } else {
            route = .app
        }
    }
}
