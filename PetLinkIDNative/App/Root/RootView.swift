import SwiftUI

struct RootView: View {
    @EnvironmentObject private var environment: AppEnvironment
    @StateObject private var viewModel = RootViewModel()

    var body: some View {
        Group {
            switch viewModel.route {
            case .onboarding:
                OnboardingView(
                    onContinue: {
                        environment.completeOnboarding()
                        viewModel.refreshRoute(environment: environment)
                    }
                )
            case .signIn:
                SignInWithAppleCard { userID in
                    environment.handleAppleSignIn(userID: userID)
                    viewModel.refreshRoute(environment: environment)
                }
                .padding()
            case .app:
                RootTabView()
            }
        }
        .onAppear {
            viewModel.refreshRoute(environment: environment)
        }
        .onChange(of: environment.hasCompletedOnboarding) { _ in
            viewModel.refreshRoute(environment: environment)
        }
        .onChange(of: environment.isSignedInWithApple) { _ in
            viewModel.refreshRoute(environment: environment)
        }
    }
}

private struct RootTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                MyPetsView()
            }
            .tabItem {
                Label("My Pets", systemImage: "pawprint.fill")
            }

            NavigationStack {
                SharedWithMeView()
            }
            .tabItem {
                Label("Shared With Me", systemImage: "person.2.fill")
            }

            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape.fill")
            }
        }
    }
}

#Preview {
    RootView()
        .environmentObject(AppEnvironment(persistence: .preview))
}
