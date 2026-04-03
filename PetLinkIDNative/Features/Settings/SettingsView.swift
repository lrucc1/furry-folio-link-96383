import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var environment: AppEnvironment

    var body: some View {
        List {
            Section("Account") {
                LabeledContent("Sign in status", value: environment.isSignedInWithApple ? "Signed In" : "Not Signed In")
                LabeledContent("Apple user", value: environment.currentAppleUserID ?? "Unavailable")
            }

            Section("Sync") {
                LabeledContent("CloudKit", value: environment.syncMonitor.statusText)
                if let message = environment.syncMonitor.lastErrorMessage {
                    Text(message)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }
            }

            Section("About") {
                LabeledContent("Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "-" )
                LabeledContent("Build", value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "-")
            }

            Section("Privacy") {
                Text("Pet data is stored locally and synced via your iCloud account when available.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Settings")
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .environmentObject(AppEnvironment(persistence: .preview))
    }
}
